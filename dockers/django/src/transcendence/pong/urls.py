from django.urls import path
import pong.views as views

urlpatterns = [
    path('api/login/', views.login_view, name='login'),
	path('api/register/', views.register_view, name='register'),
	path('api/check_login_status/', views.check_login_status, name='check_login_status'),
	path('api/create_lobby/', views.create_lobby, name='create_lobby'),
	path('api/lobbies/', views.get_lobbies, name='get_lobbies'),
	path('api/account/info/', views.get_account_info, name='get_account_info'),
    path('api/account/update/', views.update_account_info, name='update_account_info'),
    path('api/account/avatar/', views.upload_avatar, name='upload_avatar'),
]
