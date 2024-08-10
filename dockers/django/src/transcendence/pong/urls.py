from django.urls import path
import pong.views as views

urlpatterns = [
    path('api/login/', views.login_view, name='login'),
	path('api/register/', views.register_view, name='register'),
	path('api/check_login_status/', views.check_login_status, name='check_login_status'),
]