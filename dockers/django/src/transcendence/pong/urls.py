from django.urls import path
import pong.views as views

urlpatterns = [
    path('api/login/', views.login_view, name='login'),
	path('api/register/', views.register_view, name='register'),
	path('api/check_login_status/', views.check_login_status, name='check_login_status'),
	path('api/create_lobby/', views.create_lobby, name='create_lobby'),
	path('api/lobby/<str:join_code>/', views.join_lobby, name='join_lobby'),
	path('api/lobbies/', views.get_lobbies, name='get_lobbies'),
]
