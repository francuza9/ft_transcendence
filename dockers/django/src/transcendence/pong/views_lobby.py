from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
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
            join_code = ''.join(random.choices(string.ascii_letters + string.digits, k=8))

            logger.info(f"Lobby created: {join_code}")
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