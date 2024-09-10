from django.contrib.auth import authenticate, login, logout
from .models import CustomUser, Profile
from .utils import is_valid_username, is_valid_email, is_valid_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.utils import IntegrityError
import json

def login_view(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			email = data.get('email').lower()
			password = data.get('password')
			user = authenticate(request, username=email, password=password)
			if user is not None:
				login(request, user)
				return JsonResponse({'success': True})
			else:
				return JsonResponse({'success': False, 'message': 'Invalid credentials'})
		except Exception as e:
			return JsonResponse({'success': False, 'message': str(e)})
	else:
		return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def guest_login_view(request):
	if request.method == 'POST':
		try:
			user = CustomUser.create_guest_user()

			user.backend = 'django.contrib.auth.backends.ModelBackend'
			login(request, user, backend=user.backend)

			return JsonResponse({'success': True, 'username': user.username})
		except Exception as e:
			return JsonResponse({'success': False, 'message': str(e)})
	else:
		return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def register_view(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username = data.get('username')
			email = data.get('email').lower()
			password = data.get('password')
			password_confirm = data.get('passwordConfirmation')

			if not username or not email or not password or not password_confirm:
				return JsonResponse({'success': False, 'message': 'All fields are required'})

			valid, error_message = is_valid_username(username)
			if not valid:
				return JsonResponse({'success': False, 'message': error_message})

			valid, error_message = is_valid_email(email)
			if not valid:
				return JsonResponse({'success': False, 'message': error_message})

			valid, error_message = is_valid_password(password, password_confirm, username)
			if not valid:
				return JsonResponse({'success': False, 'message': error_message})

			if CustomUser.objects.filter(username=username).exists():
				return JsonResponse({'success': False, 'message': 'usernameExists'})

			if CustomUser.objects.filter(email=email).exists():
				return JsonResponse({'success': False, 'message': 'emailExists'})

			user = CustomUser.objects.create_user(username=username, email=email, password=password)
			Profile.objects.create(user=user)

			return JsonResponse({'success': True, 'message': 'User registered successfully'})

		except IntegrityError as e:
			logging.error("IntegrityError during user registration: %s", e)
			return JsonResponse({'success': False, 'message': 'registrationFailed'})

		except json.JSONDecodeError:
			return JsonResponse({'success': False, 'message': 'Invalid JSON'})

	return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)

@csrf_exempt
def check_login_status(request):
    if request.user.is_authenticated:
        user_data = {
            'username': request.user.username,
            'email': request.user.email,
			'is_guest': request.user.is_guest,
        }
        return JsonResponse({'success': True, 'user': user_data})
    else:
        return JsonResponse({'success': False, 'message': 'User is not logged in'})

@csrf_exempt
def logout_user(request):
	logout(request)
	return JsonResponse({'success': True, 'message': 'User logged out successfully'})
