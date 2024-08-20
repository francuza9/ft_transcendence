import requests
from django.conf import settings
from django.contrib.auth import get_user_model, login as django_login
from django.http import JsonResponse
from django.shortcuts import redirect
import logging

logger = logging.getLogger(__name__)
User = get_user_model()

def github(request):
    logger.info('GitHub callback received')
    code = request.GET.get('code')

    if not code:
        logger.error('No code provided in the request')
        return JsonResponse({'error': 'No code provided'}, status=400)

    logger.info(f'Authorization code received: {code}')

    try:
        # Exchange code for access token
        token_response = requests.post(
                'https://github.com/login/oauth/access_token',
                data={
                    'client_id': settings.GITHUB_CLIENT_ID,
                    'client_secret': settings.GITHUB_CLIENT_SECRET,
                    'code': code,
                    },
                headers={'Accept': 'application/json'}
                )
        token_response.raise_for_status()  # Raises an HTTPError for bad responses

        logger.info(f'Token response status code: {token_response.status_code}')
        logger.info(f'Token response content: {token_response.text}')

        token_response_data = token_response.json()
        access_token = token_response_data.get('access_token')

        if not access_token:
            error_description = token_response_data.get('error_description', 'No access token received')
            logger.error(f'Error receiving access token: {error_description}')
            return JsonResponse({'error': 'Failed to get access token'}, status=400)

        # Fetch user data from GitHub
        user_response = requests.get(
                'https://api.github.com/user',
                headers={'Authorization': f'token {access_token}'}
                )
        user_response.raise_for_status()  # Raises an HTTPError for bad responses

        logger.info(f'User data response status code: {user_response.status_code}')
        logger.info(f'User data response content: {user_response.text}')

        user_data = user_response.json()
        github_id = user_data.get('id')
        email = user_data.get('email')

        if not github_id or not email:
            logger.error('Failed to retrieve GitHub user data: missing ID or email')
            return JsonResponse({'error': 'Failed to get user data'}, status=400)

        # Create or get the user
        user, created = User.objects.get_or_create(
                github_id=github_id,
                defaults={'email': email}
                )

        # Update the GitHub token
        user.github_token = access_token
        user.save()

        if created:
            logger.info('New user created')
        else:
            logger.info('Existing user logged in')

        # Log in the user
        django_login(request, user)

        # Redirect to the home page or a desired page
        return redirect('/')

    except requests.RequestException as e:
        logger.error(f'Request failed: {e}')
        return JsonResponse({'error': 'Request failed'}, status=500)
