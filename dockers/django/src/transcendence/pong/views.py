from .models import CustomUser, Profile
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.utils import IntegrityError
import json
import logging
import random
import string

lobbies = {}

logger = logging.getLogger(__name__)

@csrf_exempt
@login_required
def create_lobby(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            is_tournament = data.get('isTournament')
            player_count = data.get('playerCount')
            map_name = data.get('map')
            lobby_name = data.get('roomName')

            join_code = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            lobbies[join_code] = {
                'is_tournament': is_tournament,
                'player_count': player_count,
                'map_name': map_name,
                'lobby_name': lobby_name,
                'admin': request.user,
                'players': []
            }
            lobbies[join_code]['players'].append(request.user)

            logger.info(f"Lobby created: {join_code} with details {lobbies[join_code]}")
            return JsonResponse({'success': True, 'join_code': join_code})

        except json.JSONDecodeError:
            logger.error("Invalid JSON received in create_lobby")
            return JsonResponse({'success': False, 'message': 'Invalid JSON'})
        except Exception as e:
            logger.error(f"Error creating lobby: {str(e)}")
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


@login_required
def join_lobby(request, join_code):
    # Retrieve the lobby using the join_code
    lobby = lobbies.get(join_code)

    # Check if the lobby exists
    if not lobby:
        logger.warning(f"Lobby with join_code {join_code} does not exist")
        return JsonResponse({'success': False, 'message': 'Lobby does not exist'})

    # Check if the user is already in the lobby
    if request.user in lobby['players']:
        logger.info(f"User {request.user.username} is already in lobby {join_code}")
        lobby_info = {
            'is_tournament': lobby['is_tournament'],
            'player_count': lobby['player_count'],
            'map_name': lobby['map_name'],
            'lobby_name': lobby['lobby_name'],
            'players': [player.username for player in lobby['players']],
            'admin': lobby['admin'].username
        }
        return JsonResponse({'success': True, 'lobby_info': lobby_info})

    # Check if the lobby is full
    if len(lobby['players']) >= lobby['player_count']:
        logger.warning(f"Lobby {join_code} is full")
        return JsonResponse({'success': False, 'message': 'Lobby is full'})

    # Add the user to the lobby
    lobby['players'].append(request.user)

    # Prepare the lobby information to be returned
    lobby_info = {
        'is_tournament': lobby['is_tournament'],
        'player_count': lobby['player_count'],
        'map_name': lobby['map_name'],
        'lobby_name': lobby['lobby_name'],
        'players': [player.username for player in lobby['players']],
        'admin': lobby['admin'].username
    }

    logger.info(f"User {request.user.username} joined lobby {join_code}")
    return JsonResponse({'success': True, 'lobby_info': lobby_info})

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
