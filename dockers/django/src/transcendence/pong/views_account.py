from .models import CustomUser, Profile
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import os

def get_profile_info(request, username):
	try:
		# Retrieve the user based on the username
		user = CustomUser.objects.get(username=username)
		profile, created = Profile.objects.get_or_create(user=user)
		avatar_url = profile.avatarUrl.url if profile.avatarUrl else None

		# Collect the user information you want to return
		user_info = {
			'username': user.username,
			'email': user.email,
			'bio': profile.bio,
			'displayName': profile.displayName,
			'avatarUrl': avatar_url,
			'gamesPlayed': profile.gamesPlayed,
			'gamesWon': profile.gamesWon,
			'gamesLost': profile.gamesLost,
		}
		# Return user info as a JSON response
		return JsonResponse(user_info, status=200)

	except ObjectDoesNotExist:
		# Return an error if the user does not exist
		return JsonResponse({'error': 'User not found'}, status=404)

	except Exception as e:
		# Handle any other errors
		return JsonResponse({'error': str(e)}, status=500)

@login_required
def get_account_info(request):
	user = request.user
	profile, created = Profile.objects.get_or_create(user=user)

	avatar_url = profile.avatarUrl.url if profile.avatarUrl else None  # Get the URL of the image

	data = {
		'username': user.username,
		'email': user.email,
		'bio': profile.bio,
		'displayName': profile.displayName,
		'avatarUrl': avatar_url,
		'gamesPlayed': profile.gamesPlayed,
		'gamesWon': profile.gamesWon,
		'gamesLost': profile.gamesLost,
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


