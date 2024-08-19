from .models import CustomUser, Profile
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import os


@login_required
def get_account_info(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)
    data = {
        'username': user.username,
        'email': user.email,
        'bio': profile.bio,
        'displayName': profile.displayName,
        # 'avatarUrl': profile.avatarUrl,
        'totalScore': profile.totalScore,
        'gamesPlayed': profile.gamesPlayed,
        'gamesWon': profile.gamesWon,
        'gamesLost': profile.gamesLost,
    }
    return JsonResponse({'success': True, 'data': data})

# @login_required
# @csrf_exempt
# def update_account_info(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             field = data.get('field')
#             new_value = data.get('value')

#             if not field or new_value is None:
#                 return JsonResponse({'success': False, 'message': 'Field and value are required'})

#             user = request.user

#             if field in [f.name for f in CustomUser._meta.get_fields()]:
#                 # Update field in CustomUser model
#                 setattr(user, field, new_value)
#                 user.save()
#                 return JsonResponse({'success': True, 'message': 'Field updated successfully'})
            
#             profile, created = Profile.objects.get_or_create(user=user)

#             if field in [f.name for f in Profile._meta.get_fields()]:
#                 # Update field in Profile model
#                 setattr(profile, field, new_value)
#                 profile.save()
#                 return JsonResponse({'success': True, 'message': 'Field updated successfully'})
            
#             return JsonResponse({'success': False, 'message': 'Invalid field'})

#         except json.JSONDecodeError:
#             return JsonResponse({'success': False, 'message': 'Invalid JSON'})
#         except ObjectDoesNotExist:
#             return JsonResponse({'success': False, 'message': 'Profile does not exist'})
#         except Exception as e:
#             return JsonResponse({'success': False, 'message': str(e)})

#     return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


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