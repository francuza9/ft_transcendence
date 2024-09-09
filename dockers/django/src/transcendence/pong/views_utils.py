
from django.core.files.base import ContentFile
from .models import CustomUser, Profile
from django.conf import settings
import requests
import os
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

def fetch_and_save_avatar(user, avatar_url):
	try:
		response = requests.get(avatar_url)
		response.raise_for_status()

		parsed_url = urlparse(avatar_url)
		file_name = os.path.basename(parsed_url.path)
		file_content = ContentFile(response.content, file_name)

		profile, created = Profile.objects.get_or_create(
			user=user,
			defaults={'displayName': user.username}
		)

		if created or not profile.avatarUrl:
			profile.avatarUrl.save(file_name, file_content, save=True)
			logger.info(f"Avatar saved for user: {user.username}")
		else:
			logger.info("Avatar already exists, skipping update.")

		return profile.avatarUrl.url

	except requests.RequestException as e:
		logger.error(f"Error fetching avatar: {e}")
		return None
	except Exception as e:
		logger.error(f"An unexpected error occurred: {e}")
		return None
	
def get_unique_username(base_username):
	username = base_username
	counter = 1
	# Keep appending a counter until a unique username is found
	while CustomUser.objects.filter(username=username).exists():
		username = f"{base_username}{counter}"
		counter += 1
	return username

def get_unique_email(base_email):
	if base_email is None:
		return None

	email_name, domain = base_email.split('@')
	email = base_email
	counter = 1

	# Keep appending a counter until a unique email is found
	while CustomUser.objects.filter(email=email).exists():
		email = f"{email_name}{counter}@{domain}"
		counter += 1
	return email

def create_or_get_username(user_data):
	base_username = user_data.get('login')

	# Check if the base username exists
	if not CustomUser.objects.filter(username=base_username).exists():
		return base_username
	else:
		# If username exists, generate a unique one by appending a counter
		return get_unique_username(base_username)

def create_or_get_email(user_data):
	base_email = user_data.get('email')

	# If email is not provided by GitHub
	if base_email is None:
		# Use a placeholder email (if email is required) or return None
		return f"{user_data.get('login')}@placeholder.com"

	# Check if the email already exists
	if not CustomUser.objects.filter(email=base_email).exists():
		return base_email
	else:
		# If email exists, generate a unique one by appending a counter
		return get_unique_email(base_email)