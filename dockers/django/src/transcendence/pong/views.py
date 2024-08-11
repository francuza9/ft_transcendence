from .models import CustomUser, Profile
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.utils import IntegrityError
import json
import logging
import random
import string
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)

rooms = {}

@csrf_exempt
@login_required
def create_room(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            is_tournament = data.get('isTournament')
            player_count = data.get('playerCount')
            map_name = data.get('map')
            room_name = data.get('roomName')

            # Generate a unique join code
            join_code = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            rooms[join_code] = {
                'is_tournament': is_tournament,
                'player_count': player_count,
                'map_name': map_name,
                'room_name': room_name,
                'admin': request.user,
                'players': []
            }

            return JsonResponse({'success': True, 'join_code': join_code})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


@login_required
def join_room(request, join_code):
    room = rooms.get(join_code)

    if not room:
        return JsonResponse({'success': False, 'message': 'Room does not exist'})

    if len(room['players']) >= room['player_count']:
        return JsonResponse({'success': False, 'message': 'Room is full'})

    # Add the user to the room
    room['players'].append(request.user)

    return JsonResponse({'success': True, 'message': 'Joined the room successfully'})

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