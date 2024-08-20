import requests
from django.conf import settings
from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.contrib.auth import login as django_login
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session

def github_login(request):
    client_id = settings.GITHUB_CLIENT_ID
    redirect_uri = request.build_absolute_uri('/auth/github/callback/')
    return redirect(f'https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}')

def github_callback(request):
    code = request.GET.get('code')
    if not code:
        return HttpResponse('No code provided', status=400)
    
    # Exchange code for access token
    token_response = requests.post(
        'https://github.com/login/oauth/access_token',
        data={
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code,
        },
        headers={'Accept': 'application/json'}
    )
    token_response_data = token_response.json()
    access_token = token_response_data.get('access_token')

    if not access_token:
        return HttpResponse('Error fetching access token', status=400)

    # Fetch user data from GitHub
    user_response = requests.get(
        'https://api.github.com/user',
        headers={'Authorization': f'token {access_token}'}
    )
    user_data = user_response.json()

    # Create or get user
    user, created = User.objects.get_or_create(
        username=user_data['login'],
        defaults={'email': user_data.get('email', '')}
    )

    if created:
        user.set_unusable_password()  # or handle password differently
        user.save()

    # Log in the user
    django_login(request, user)

    return redirect('/')
