from .views_auth import (
    login_view,
    register_view,
    check_login_status,
)

from .views_lobby import (
    create_lobby,
    join_lobby,
    leave_lobby,
    get_lobbies,
)
	
from .views_account import (
    get_account_info,
    update_account_info,
    upload_avatar,
)