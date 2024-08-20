from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Profile

@login_required
@csrf_exempt
def update_avatar(request):
    if request.method == 'POST':
        user_profile = Profile.objects.get(user=request.user)

        if 'avatar' not in request.FILES:
            return JsonResponse({'success': False, 'message': 'No file uploaded.'}, status=400)
        
        avatar_file = request.FILES['avatar']

        # If there is an existing avatar, delete the old file
        if user_profile.avatarUrl:
            user_profile.avatarUrl.delete(save=False)
        
        # Assign the new file to the avatarUrl field
        user_profile.avatarUrl = avatar_file
        user_profile.save()

        return JsonResponse({'success': True, 'avatarUrl': user_profile.avatarUrl.url})

    return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)

@login_required
@csrf_exempt
def remove_avatar(request):
    if request.method == 'POST':
        user_profile = Profile.objects.get(user=request.user)

        # If there is an avatar, delete the file
        if user_profile.avatarUrl:
            user_profile.avatarUrl.delete(save=False)
        
        # Set the avatar field to None
        user_profile.avatarUrl = None
        user_profile.save()

        # Optionally, send the default avatar URL back (e.g., '/static/default-avatar.png')
        return JsonResponse({'success': True, 'avatarUrl': '/static/default-avatar.png'})

    return JsonResponse({'success': False, 'message': 'Invalid request method.'}, status=405)
