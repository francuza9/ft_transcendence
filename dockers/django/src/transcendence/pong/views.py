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

from .views_lobby import (
    create_lobby,
    get_lobbies,
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
)

from .views_friends import (
	get_friends,
	get_messages,
)

