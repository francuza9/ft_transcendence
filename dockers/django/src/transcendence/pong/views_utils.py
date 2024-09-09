
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
	
def create_email_placeholder(base_email):
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
