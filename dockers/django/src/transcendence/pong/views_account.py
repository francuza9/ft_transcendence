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

	avatar_url = profile.avatarUrl.url if profile.avatarUrl else None  # Get the URL of the image

	print(profile.avatarUrl.path)  # Outputs the full file path on the server
	print(profile.avatarUrl.url)   # Outputs the URL relative to MEDIA_URL
	data = {
		'username': user.username,
		'email': user.email,
		'bio': profile.bio,
		'displayName': profile.displayName,
		'avatarUrl': avatar_url,
		'totalScore': profile.totalScore,
		'gamesPlayed': profile.gamesPlayed,
		'gamesWon': profile.gamesWon,
		'gamesLost': profile.gamesLost,
		'avatarPath': profile.avatarUrl.path  #remove this line later
	}

	return JsonResponse({'success': True, 'data': data})

@login_required
@csrf_exempt
def update_account_info(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            field = data.get('field')
            new_value = data.get('value')

            if not field or new_value is None:
                return JsonResponse({'success': False, 'message': 'Field and value are required'})

            user = request.user

            if field in [f.name for f in CustomUser._meta.get_fields()]:
                # Update field in CustomUser model
                setattr(user, field, new_value)
                user.save()
                return JsonResponse({'success': True, 'message': 'Field updated successfully'})
            
            profile, created = Profile.objects.get_or_create(user=user)

            if field in [f.name for f in Profile._meta.get_fields()]:
                # Update field in Profile model
                setattr(profile, field, new_value)
                profile.save()
                return JsonResponse({'success': True, 'message': 'Field updated successfully'})
            
            return JsonResponse({'success': False, 'message': 'Invalid field'})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON'})
        except ObjectDoesNotExist:
            return JsonResponse({'success': False, 'message': 'Profile does not exist'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})

    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


