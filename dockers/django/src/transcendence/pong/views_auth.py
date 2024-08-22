from django.contrib.auth import authenticate, login, logout
from .models import CustomUser, Profile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.utils import IntegrityError
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def login_view(request):
	logger.info("Login view called")
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			email = data.get('email')
			password = data.get('password')
			logger.info(f"Received email: {email} and password: {password}")

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
			# Create the guest user
			user = CustomUser.create_guest_user()

			# Log the guest user in, specifying the backend manually
			user.backend = 'django.contrib.auth.backends.ModelBackend'
			login(request, user, backend=user.backend)

			# Return success response with the guest username
			return JsonResponse({'success': True, 'username': user.username})
		except Exception as e:
			# Handle any errors that occur
			return JsonResponse({'success': False, 'message': str(e)})
	else:
		# Invalid request method
		return JsonResponse({'success': False, 'message': 'Invalid request method'})

@csrf_exempt
def register_view(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			username = data.get('username')
			email = data.get('email')
			password = data.get('password')

			if not username or not email or not password:
				return JsonResponse({'success': False, 'message': 'All fields are required'})

			if CustomUser.objects.filter(username=username).exists():
				return JsonResponse({'success': False, 'message': 'Username already exists'})

			if CustomUser.objects.filter(email=email).exists():
				return JsonResponse({'success': False, 'message': 'Email already exists'})

			user = CustomUser.objects.create_user(username=username, email=email, password=password)
		
			Profile.objects.create(user=user)

			return JsonResponse({'success': True, 'message': 'User registered successfully'})

		except IntegrityError as e:
			logging.error("IntegrityError during user registration: %s", e)
			return JsonResponse({'success': False, 'message': 'An unexpected database error occurred. Please try again.'})

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
        logger.info(f"Authenticated user data: {user_data}")
        return JsonResponse({'success': True, 'user': user_data})
    else:
        return JsonResponse({'success': False, 'message': 'User is not logged in'})

@csrf_exempt
def logout_user(request):
	logout(request)
	return JsonResponse({'success': True, 'message': 'User logged out successfully'})