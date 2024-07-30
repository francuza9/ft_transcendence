from django.urls import path
from . import views

urlpatterns = [
	path('pong/', views.pong, name='pong'),
	path('pong/login/', views.login_view, name='login'),
	path('pong/register/', views.register_view, name='register'),
]