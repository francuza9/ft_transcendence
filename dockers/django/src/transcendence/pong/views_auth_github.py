import requests
from .views_utils import fetch_and_save_avatar, create_email_placeholder
from django.conf import settings
from django.contrib.auth import login as django_login
from django.http import JsonResponse
from django.shortcuts import redirect
from .models import CustomUser
import logging

logger = logging.getLogger(__name__)

def github(request):
    logger.info('GitHub callback received')
    code = request.GET.get('code')

    if not code:
        logger.error('No code provided in the request')
        return JsonResponse({'error': 'No code provided'}, status=400)

    logger.info(f'Authorization code received: {code}')

    try:
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            data={
                'client_id': settings.GITHUB_CLIENT_ID,
                'client_secret': settings.GITHUB_CLIENT_SECRET,
                'code': code,
            },
            headers={'Accept': 'application/json'}
        )
        token_response.raise_for_status()

        logger.info(f'Token response status code: {token_response.status_code}')
        logger.info(f'Token response content: {token_response.text}')

        token_response_data = token_response.json()
        access_token = token_response_data.get('access_token')

        if not access_token:
            error_description = token_response_data.get('error_description', 'No access token received')
            logger.error(f'Error receiving access token: {error_description}')
            return JsonResponse({'error': 'Failed to get access token'}, status=400)

        user_response = requests.get(
            'https://api.github.com/user',
            headers={'Authorization': f'token {access_token}'}
        )
        user_response.raise_for_status()

        logger.info(f'User data response status code: {user_response.status_code}')
        logger.info(f'User data response content: {user_response.text}')

        user_data = user_response.json()
        github_id = user_data.get('id')
        username = user_data.get('login') + "\u200B" # Zero-width space to prevent duplicate usernames
        email = user_data.get('email')
        if CustomUser.objects.filter(email=email).exists():
            email = create_email_placeholder(email)
        avatar_url = user_data.get('avatar_url')

        if not github_id:
            logger.error('Failed to retrieve GitHub user data: missing ID')
            return JsonResponse({'error': 'Failed to get user data'}, status=400)

        user, created = CustomUser.objects.get_or_create(
            github_id=github_id,
            username=username,
            defaults={'email': email}
        )

        user.github_token = access_token
        user.save()

        fetch_and_save_avatar(user, avatar_url)

        if created:
            logger.info('New user created')
        else:
            logger.info('Existing user logged in')

        user.backend = 'django.contrib.auth.backends.ModelBackend'

        django_login(request, user, backend=user.backend)

        return redirect('/')

    except requests.RequestException as e:
        logger.error(f'Request failed: {e}')
        return JsonResponse({'error': 'Request failed'}, status=500)
