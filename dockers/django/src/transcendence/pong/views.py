from django.middleware.csrf import get_token
from django.http import JsonResponse

def get_csrf_token(request):
	return JsonResponse({'csrftoken': get_token(request)})

from .views_auth import (
    login_view,
    register_view,
	guest_login_view,
    check_login_status,
    logout_user,
)

from .views_auth_github import (
    github,
)

from .views_auth_42 import (
    forty_two,
)

from .views_lobby import (
    create_lobby,
    get_lobbies,
	check_lobby_status,
)
	
from .views_account import (
	get_profile_info,
	get_account_info,
	update_account_info,
	password_update,
)

from .views_avatar import (
    update_avatar,
    remove_avatar,
)

from .views_leaderboard import (
	leaderboard_win_rate,
    match_history,
)

from .views_friends import (
	get_friends,
	get_blocked,
	get_friend_requests,
	get_messages,
)

