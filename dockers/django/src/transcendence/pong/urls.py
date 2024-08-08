from django.urls import path
from .views import login_view

urlpatterns = [
    path('api/login/', login_view, name='login'),
]