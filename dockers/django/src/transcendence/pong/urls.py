from django.urls import path
import pong.views as views

urlpatterns = [
	path('api/login/', views.login_view, name='login'),
	path('api/register/', views.register_view, name='register'),
	path('api/guest_login/', views.guest_login_view, name='guest_login'),
	path('api/check_login_status/', views.check_login_status, name='check_login_status'),
	path('api/create_lobby/', views.create_lobby, name='create_lobby'),
	path('api/lobbies/', views.get_lobbies, name='get_lobbies'),
	path('api/profile_info/<str:username>/', views.get_profile_info, name='get_profile_info'),
	path('api/account_info/', views.get_account_info, name='get_account_info'),
	path('api/account_update/', views.update_account_info, name='update_account_info'),
	path('api/password_update/', views.password_update, name='password_update'),
	path('api/avatar_update/', views.update_avatar, name='update_avatar'),
	path('api/avatar_remove/', views.remove_avatar, name='remove_avatar'),
    path('api/logout/', views.logout_user, name='logout_user'),
    path('api/github/', views.github, name='github'),
	path('api/leaderboard/win_rate/', views.leaderboard_win_rate, name='leaderboard_win_rate'),
    path('api/friends/', views.get_friends, name='get_friends'),
	path('api/blocked/', views.get_blocked, name='get_blocked'),
	path('api/friend_requests/', views.get_friend_requests, name='get_friend_requests'),
	path('api/messages/<str:username>/', views.get_messages, name='get_messages'),
    path('api/match_history/<str:username>/', views.match_history, name='match_history'),
	path('api/lobby/status/<str:lobby_id>/', views.check_lobby_status, name='check_lobby_status'),
]
