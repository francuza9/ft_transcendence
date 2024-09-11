from django.utils.deconstruct import deconstructible
import logging
import os
import re

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
		return False, "usernameLengthError"
	if not re.match(r'^[A-Za-z0-9_]+$', username):
		return False, "usernameComponentsError"
	if ' ' in username:
		return False, "usernameSpaceError"
	if username[0] == '_' or username[-1] == '_':
		return False, "usernameUnderscoreError"
	if '__' in username:
		return False, "usernameConsecutiveError"
	if not any(char.isalpha() for char in username):
		return False, "usernameLetterError"
	if username.lower() in COMMON_USERNAMES:
		return False, "usernameCommonError"
	if username[-3:] == "_42" or username[-3:] == "_GH":
		return False, "usernameCommonError"

	return True, None

def is_valid_display_name(display_name):
	if len(display_name) < 3 or len(display_name) > 12:
		return False, "displayNameLengthError"
	# if ' ' in display_name:
	# 	return False, "Display name cannot contain spaces."
	if not any(char.isalpha() for char in display_name):
		return False, "displayNameLetterError"
	
	return True, None

def is_valid_password(password, password_confirm, username):
	if len(password) < 8 or len(password) > 32:
		return False, "passwordLengthError"
	if not re.search(r'[0-9]', password):
		return False, "passwordDigitError"
	if not re.search(r'[a-z]', password):
		return False, "passwordLowercaseError"
	if not re.search(r'[A-Z]', password):
		return False, "passwordUppercaseError"
	if password == username:
		return False, "passwordUsernameError"
	if password != password_confirm:
		return False, "passwordMatchError"

	return True, None

def is_valid_email(email):
	if not email:
		return False, "emailEmptyError"
	if ' ' in email:
		return False, "emailSpaceError"
	if len(email) > 64:
		return False, "emailLengthError"
	if not re.match(r'^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$', email):
		return False, "emailFormatError"
	#if email contains @student.42 in its domain
	if "@student.42" in email:
		return False, "emailStudentError"

	return True, None


def is_valid_bio(bio): 
	if len(bio) > 200:
		return False, "bioLengthError"
	if bio.count('\n') > 4:
		return False, "bioLineError"
	return True, None
