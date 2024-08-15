from .models import CustomUser, Profile
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import os


@login_required
def get_account_info(request):
    user = request.user
    profile = user.profile
    data = {
        'username': user.username,
        'email': user.email,
        'bio': user.bio,
        'displayName': profile.displayName,
        'avatarUrl': profile.avatarUrl,
        'totalScore': profile.totalScore,
        'gamesPlayed': profile.gamesPlayed,
        'gamesWon': profile.gamesWon,
        'gamesLost': profile.gamesLost,
    }
    return JsonResponse({'success': True, 'data': data})

@login_required
@csrf_exempt
def update_account_info(request):
    if request.method == 'POST':
        user = request.user
        profile = user.profile

        # Get data from POST request
        displayName = request.POST.get('displayName')
        bio = request.POST.get('bio')
        email = request.POST.get('email')

        if displayName:
            profile.displayName = displayName
        if bio:
            user.bio = bio
        if email:
            user.email = email

        user.save()
        profile.save()

        return JsonResponse({'success': True, 'message': 'Profile updated successfully.'})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method.'})

@login_required
@csrf_exempt
def upload_avatar(request):
    if request.method == 'POST' and request.FILES.get('avatar'):
        user = request.user
        profile = user.profile
        avatar = request.FILES['avatar']

        # Save the file to the media directory
        avatar_name = f"avatars/{user.username}_{avatar.name}"
        avatar_path = default_storage.save(avatar_name, avatar)
        profile.avatarUrl = os.path.join(settings.MEDIA_URL, avatar_name)
        profile.save()

        return JsonResponse({'success': True, 'message': 'Avatar uploaded successfully.', 'avatarUrl': profile.avatarUrl})
    else:
        return JsonResponse({'success': False, 'message': 'No file uploaded.'})