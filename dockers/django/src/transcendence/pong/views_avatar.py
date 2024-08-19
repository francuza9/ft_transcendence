from .models import CustomUser, Profile
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import os


@login_required
@csrf_exempt
def update_avatar(request):
    if request.method == 'POST':
        user_profile = Profile.objects.get(user=request.user)  # Get the user profile

        # Check if the avatar file exists in the request
        if 'avatar' not in request.FILES:
            return JsonResponse({'success': False, 'message': 'No file uploaded.'}, status=400)
        
        avatar_file = request.FILES['avatar']
        
        # If there is an existing avatar and it's not null, delete it
        if user_profile.avatarUrl:
            user_profile.avatarUrl.delete(save=False)
        
        # Assign the new file to the avatarUrl field
        user_profile.avatarUrl = avatar_file
        user_profile.save()

        return JsonResponse({'success': True, 'avatarUrl': user_profile.avatarUrl.url})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)

@csrf_exempt
def remove_avatar(request):
    if request.method == 'POST':
        user_profile = Profile.objects.get(user=request.user)  # Get the user profile

        # If there is an avatar, delete the file
        if user_profile.avatarUrl:
            user_profile.avatarUrl.delete(save=False)
        
        # Set the avatar field to null (remove the avatar)
        user_profile.avatarUrl = None
        user_profile.save()

        return JsonResponse({'success': True, 'avatarUrl': None})  # No avatar after removal
    
    return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)
