from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from .consumers_lobby import lobby_data
import json
import logging
import random
import string

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

@require_GET
def check_lobby_status(request, lobby_id):
	lobby_exists = lobby_id in lobby_data
	
	if lobby_exists:
		if lobby_data[lobby_id]['available'] and not lobby_data[lobby_id]['started']:
			return JsonResponse({'availability': 'free'})
		elif lobby_data[lobby_id]['started']:
			return JsonResponse({'availability': 'ingame'})

	return JsonResponse({'availability': 'full_or_invalid'})

def get_lobbies(request):
	lobbies_list = []
	for join_code, lobby in lobby_data.items():
		lobby_info = {
			'join_code': join_code,
			'is_tournament': lobby['is_tournament'],
			'max_player_count': lobby['max_users'],
			'map_name': lobby['map'],
			'lobby_name': lobby['room_name'],
			'players': lobby['players'],
			'admin': lobby['admin']
		}
		lobbies_list.append(lobby_info)

	return JsonResponse({'success': True, 'lobbies': lobbies_list})
