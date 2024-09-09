import os
import re
import requests
from urllib.parse import urlparse
from django.utils.deconstruct import deconstructible
import logging

logger = logging.getLogger(__name__)

@deconstructible
class UploadTo(object):
    def __init__(self, path):
        self.path = path

    def __call__(self, instance, filename):
        return os.path.join(self.path, filename)

COMMON_USERNAMES = [
	'administrator', 'guest', 'system', 'support', 'superuser', 'moderator', 'operator', 'service', 'manager', 'staff',
	'www', 'root', 'webmaster', 'sysadmin', 'ftp', 'mail', 'postmaster', 'hostmaster', 'server', 'monitor', 'daemon',
	'test', 'tester', 'demo', 'dev', 'developer', 'admin', 'owner', 'manager', 'user', 'username', 'login', 'signup',
	'user1', 'user123', 'anonymous', 'nobody', 'default', 'unknown', 'hacker', 'cracker', 'password', 'security',
	'Player 1', 'Player 2',
]


def is_valid_username(username):
	if len(username) < 3 or len(username) > 12:
		return False, "Username must be between 3 and 12 characters long."
	if not re.match(r'^[A-Za-z0-9_]+$', username):
		return False, "Username can only contain alphanumeric characters and underscores."
	if ' ' in username:
		return False, "Username cannot contain spaces."
	if username[0] == '_' or username[-1] == '_':
		return False, "Username cannot start or end with an underscore."
	if '__' in username:
		return False, "Username cannot contain consecutive underscores."
	if not any(char.isalpha() for char in username):
		return False, "Username must contain at least one letter."
	if username.lower() in COMMON_USERNAMES:
		return False, "The chosen username is too common."

	return True, None

def is_valid_display_name(display_name):
	if len(display_name) < 3 or len(display_name) > 12:
		return False, "Display name must be between 3 and 12 characters long."
	# if ' ' in display_name:
	# 	return False, "Display name cannot contain spaces."
	if not any(char.isalpha() for char in display_name):
		return False, "Display name must contain at least one letter."
	
	return True, None

def is_valid_password(password, password_confirm, username):
	if len(password) < 8 or len(password) > 32:
		return False, "Password must be between 8 and 32 characters long."
	if password == username:
		return False, "Password cannot be the same as the username."
	if not re.search(r'[0-9]', password):
		return False, "Password must contain at least one number."
	if not re.search(r'[a-z]', password):
		return False, "Password must contain at least one lowercase letter."
	if not re.search(r'[A-Z]', password):
		return False, "Password must contain at least one uppercase letter."
	if password != password_confirm:
		return False, "Passwords do not match."

	return True, None

def is_valid_email(email):
	if not email:
		return False, "Email cannot be empty."
	if ' ' in email:
		return False, "Email cannot contain spaces."
	if len(email) > 64:
		return False, "Email cannot be longer than 64 characters."
	if not re.match(r'^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', email):
		return False, "Invalid email format."

	return True, None


def is_valid_bio(bio): 
	if len(bio) > 200:
		return False, "Bio cannot be longer than 200 characters."
	if bio.count('\n') > 4:
		return False, "Bio cannot be longer than 5 lines."
	return True, None
