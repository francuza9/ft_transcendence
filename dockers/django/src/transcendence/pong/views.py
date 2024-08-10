from .models import CustomUser, Profile
from django.contrib.auth import authenticate, login
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
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            # Check if all required fields are provided
            if not username or not email or not password:
                return JsonResponse({'success': False, 'message': 'All fields are required'})

            # Check for duplicate username
            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'message': 'Username already exists'})

            # Check for duplicate email
            if CustomUser.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already exists'})

            # Attempt to create a new user
            user = CustomUser.objects.create_user(username=username, email=email, password=password)
            user.save()

            return JsonResponse({'success': True, 'message': 'User registered successfully'})

        except IntegrityError as e:
            # Log error message and handle any unexpected integrity issues
            logging.error("IntegrityError during user registration: %s", e)
            return JsonResponse({'success': False, 'message': 'An unexpected database error occurred. Please try again.'})
        
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON'})

    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)

# @csrf_exempt
# def user_info(request):
#     if request.user.is_authenticated:
#         user_data = {
# 			'id': request.user.id,
#             'username': request.user.username,
#             'email': request.user.email,
#             # Add more fields as needed
#         }
#         return JsonResponse({'success': True, 'user': user_data})
#     else:
#         return JsonResponse({'success': False, 'message': 'User is not authenticated'})

@csrf_exempt
def check_login_status(request):
    if request.user.is_authenticated:
        # User is authenticated, send back user data
        user_data = {
            'username': request.user.username,
            'email': request.user.email,
            # Add more user data if needed
        }
        return JsonResponse({'success': True, 'user': user_data})
    else:
        # User is not authenticated
        return JsonResponse({'success': False, 'message': 'User is not logged in'})