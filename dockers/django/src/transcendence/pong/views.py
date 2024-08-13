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
                'player_count': int(player_count),
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


@csrf_exempt
@login_required
def join_lobby(request, join_code):
    lobby = lobbies.get(join_code)

    if not lobby:
        logger.warning(f"Lobby with join_code {join_code} does not exist")
        return JsonResponse({'success': False, 'message': 'Lobby does not exist'})

    if len(lobby['players']) >= lobby['player_count']:
        logger.warning(f"Lobby {join_code} is full")
        return JsonResponse({'success': False, 'message': 'Lobby is full'})

    if request.user in lobby['players']:
        logger.info(f"User {request.user.username} is already in lobby {join_code}")
    else:
        lobby['players'].append(request.user)
        logger.info(f"User {request.user.username} joined lobby {join_code}")

    lobby_info = {
        'is_tournament': lobby['is_tournament'],
        'player_count': lobby['player_count'],
        'map_name': lobby['map_name'],
        'lobby_name': lobby['lobby_name'],
        'players': [
            {
                'username': player.username,
                'totalScore': player.profile.totalScore if hasattr(player, 'profile') else 0,
                'profile_picture': player.profile.avatarUrl if hasattr(player, 'profile') else None
            }
            for player in lobby['players']
        ],
        'admin': lobby['admin'].username
    }

    return JsonResponse({'success': True, 'lobby_info': lobby_info, 'current_user': request.user.username})

@csrf_exempt
@login_required
def leave_lobby(request, join_code):
    lobby = lobbies.get(join_code)

    if not lobby:
        logger.warning(f"Attempted to leave a non-existent lobby with join_code {join_code}")
        return JsonResponse({'success': False, 'message': 'Lobby does not exist'})

    if request.user not in lobby['players']:
        logger.warning(f"User {request.user.username} attempted to leave lobby {join_code} they are not part of")
        return JsonResponse({'success': False, 'message': 'You are not in this lobby'})

    lobby['players'].remove(request.user)
    logger.info(f"User {request.user.username} left lobby {join_code}")

    if request.user == lobby['admin'] and lobby['players']:
        new_admin = lobby['players'][0]
        lobby['admin'] = new_admin
        logger.info(f"Admin role in lobby {join_code} transferred to {new_admin.username}")

    if not lobby['players']:
        logger.info(f"No players left in lobby {join_code}, deleting lobby")
        del lobbies[join_code]

    return JsonResponse({'success': True, 'message': 'Left the lobby successfully'})

@login_required
def get_lobbies(request):
	lobbies_list = []
	for join_code, lobby in lobbies.items():
		lobby_info = {
			'join_code': join_code,
			'is_tournament': lobby['is_tournament'],
			'player_count': lobby['player_count'],
			'map_name': lobby['map_name'],
			'lobby_name': lobby['lobby_name'],
			'players': [player.username for player in lobby['players']],
			'admin': lobby['admin'].username
		}
		lobbies_list.append(lobby_info)

	return JsonResponse({'success': True, 'lobbies': lobbies_list})

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

            if not username or not email or not password:
                return JsonResponse({'success': False, 'message': 'All fields are required'})

            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({'success': False, 'message': 'Username already exists'})

            if CustomUser.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already exists'})

            user = CustomUser.objects.create_user(username=username, email=email, password=password)
            user.save()

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
        }
        return JsonResponse({'success': True, 'user': user_data})
    else:
        return JsonResponse({'success': False, 'message': 'User is not logged in'})