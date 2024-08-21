import requests
from django.core.files.base import ContentFile
from django.conf import settings
from django.contrib.auth import login as django_login
from django.http import JsonResponse
from django.shortcuts import redirect
import logging
import os

from .models import CustomUser as User, Profile

logger = logging.getLogger(__name__)

def fetch_and_save_avatar(user, avatar_url):
	try:
		response = requests.get(avatar_url)
		response.raise_for_status()

		# Create a file name based on the URL
		file_name = os.path.basename(avatar_url)
		file_content = ContentFile(response.content, file_name)

		# Get or create the profile
		profile, created = Profile.objects.get_or_create(
			user=user,
			defaults={'displayName': user.username}
		)

		if created or profile.avatarUrl.name == '':
			profile.avatarUrl.save(file_name, file_content, save=True)
		else:
			# Optionally update the avatar if it's different
			profile.avatarUrl.save(file_name, file_content, save=True)
		
		return profile.avatarUrl.url

	except requests.RequestException as e:
		logger.error(f"Error fetching avatar: {e}")
		return None

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
        token_response.raise_for_status()

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
        user_response.raise_for_status()

        logger.info(f'User data response status code: {user_response.status_code}')
        logger.info(f'User data response content: {user_response.text}')

        user_data = user_response.json()
        github_id = user_data.get('id')
        username = user_data.get('login')
        email = user_data.get('email')
        avatar_url = user_data.get('avatar_url')

        if not github_id:
            logger.error('Failed to retrieve GitHub user data: missing ID')
            return JsonResponse({'error': 'Failed to get user data'}, status=400)

        # Create or get the user, allow email to be None
        user, created = User.objects.get_or_create(
            github_id=github_id,
            username=username,
            defaults={'email': email}
        )

        # Update the GitHub token
        user.github_token = access_token
        user.save()

        # Fetch and save the GitHub avatar
        fetch_and_save_avatar(user, avatar_url)

        if created:
            logger.info('New user created')
        else:
            logger.info('Existing user logged in')

        # Specify the backend for the user
        user.backend = 'django.contrib.auth.backends.ModelBackend'

        # Log in the user
        django_login(request, user, backend=user.backend)

        # Redirect to the home page or a desired page
        return redirect('/')

    except requests.RequestException as e:
        logger.error(f'Request failed: {e}')
        return JsonResponse({'error': 'Request failed'}, status=500)
