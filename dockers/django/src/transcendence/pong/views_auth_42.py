import requests
import logging
import os
from django.conf import settings
from django.contrib.auth import login as django_login
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.shortcuts import redirect, get_object_or_404

from .models import CustomUser as User, Profile

logger = logging.getLogger(__name__)

def fetch_and_save_avatar(user, avatar_url):
    try:
        response = requests.get(avatar_url)
        response.raise_for_status()

        file_name = os.path.basename(avatar_url)
        file_content = ContentFile(response.content, file_name)

        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={'displayName': user.username}
        )

        if profile.avatarUrl.name == '':
            profile.avatarUrl.save(file_name, file_content, save=True)
        else:
            profile.avatarUrl.save(file_name, file_content, save=True)
        
        return profile.avatarUrl.url

    except requests.RequestException as e:
        logger.error(f"Error fetching avatar: {e}")
        return None

def forty_two(request):
    code = request.GET.get('code')

    if not code:
        logger.error('No code provided in the request')
        return JsonResponse({'error': 'No code provided'}, status=400)

    try:
        token_response = requests.post(
            'https://api.intra.42.fr/oauth/token',
            data={
                'grant_type': 'authorization_code',
                'client_id': settings.FORTY_TWO_CLIENT_ID,
                'client_secret': settings.FORTY_TWO_CLIENT_SECRET,
                'code': code,
                'redirect_uri': 'https://10.11.249.79/api/42/'
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        token_response.raise_for_status()

        token_response_data = token_response.json()
        access_token = token_response_data.get('access_token')

        if not access_token:
            error_description = token_response_data.get('error_description', 'No access token received')
            logger.error(f'Error receiving access token: {error_description}')
            return JsonResponse({'error': 'Failed to get access token'}, status=400)

        user_response = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        user_response.raise_for_status()

        user_data = user_response.json()
        forty_two_id = user_data.get('id')
        username = user_data.get('login')
        email = user_data.get('email')
        image_data = user_data.get('image', {})
        avatar_url = image_data.get('link')

        if not forty_two_id:
            logger.error('Failed to retrieve 42 user data: missing ID')
            return JsonResponse({'error': 'Failed to get user data'}, status=400)

        user, created = User.objects.get_or_create(
            forty_two_id=forty_two_id,
            defaults={'username': username, 'email': email}
        )

        user.forty_two_token = access_token
        user.save()

        fetch_and_save_avatar(user, avatar_url)

        if created:
            logger.info('New 42 user created')
        else:
            logger.info('Existing 42 user logged in')

        user.backend = 'django.contrib.auth.backends.ModelBackend'

        django_login(request, user, backend=user.backend)

        return redirect('/')

    except requests.RequestException as e:
        logger.error(f'Request failed: {e}')
        return JsonResponse({'error': 'Request failed'}, status=500)
