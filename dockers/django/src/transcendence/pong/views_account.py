from .models import CustomUser, Profile
from django.contrib.auth.decorators import login_required
from .utils import is_valid_email, is_valid_password, is_valid_display_name, is_valid_bio
from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import update_session_auth_hash
from django.conf import settings
import json

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

			if field == 'email':
				# Convert email to lowercase and check for uniqueness
				new_value = new_value.lower()
				if CustomUser.objects.filter(email=new_value).exclude(id=user.id).exists():
					return JsonResponse({'success': False, 'message': 'Email is already in use'})
				
				valid, error_message = is_valid_email(new_value)
				if not valid:
					return JsonResponse({'success': False, 'message': error_message})
				
				user.email = new_value
				user.save()
				return JsonResponse({'success': True, 'message': 'Field updated successfully'})

			profile, created = Profile.objects.get_or_create(user=user)

			if field == 'displayName':
				valid, error_message = is_valid_display_name(new_value)
				if not valid:
					return JsonResponse({'success': False, 'message': error_message})
				
				profile.displayName = new_value
				profile.save()
				return JsonResponse({'success': True, 'message': 'Field updated successfully'})
			
			if field == 'bio':
				valid, error_message = is_valid_bio(new_value)
				profile.bio = new_value
				profile.save()
				return JsonResponse({'success': True, 'message': 'Field updated successfully'})


			# if field in [f.name for f in CustomUser._meta.get_fields()]:
			# 	# Update field in CustomUser model
			# 	setattr(user, field, new_value)
			# 	user.save()
			# 	return JsonResponse({'success': True, 'message': 'Field updated successfully'})
			
			# profile, created = Profile.objects.get_or_create(user=user)

			# if field in [f.name for f in Profile._meta.get_fields()]:
			# 	# Update field in Profile model
			# 	setattr(profile, field, new_value)
			# 	profile.save()
			# 	return JsonResponse({'success': True, 'message': 'Field updated successfully'})
			
			# return JsonResponse({'success': False, 'message': 'Invalid field'})

		except json.JSONDecodeError:
			return JsonResponse({'success': False, 'message': 'Invalid JSON'})
		except ObjectDoesNotExist:
			return JsonResponse({'success': False, 'message': 'Profile does not exist'})
		except Exception as e:
			return JsonResponse({'success': False, 'message': str(e)})

	return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)


@login_required
@csrf_exempt
def password_update(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			old_password = data.get('currentPassword')
			new_password = data.get('newPassword')
			confirm_password = data.get('confirmPassword')

			if not old_password or not new_password or not confirm_password:
				return JsonResponse({'success': False, 'message': 'All fields are required'})

			user = request.user

			if not user.check_password(old_password):
				return JsonResponse({'success': False, 'message': 'Current password is incorrect'})
			
			valid, error_message = is_valid_password(new_password, confirm_password, user.username)
			if not valid:
				return JsonResponse({'success': False, 'message': error_message})
			
			user.set_password(new_password)
			user.save()

			update_session_auth_hash(request, user)

			return JsonResponse({'success': True, 'message': 'Password updated successfully'})

		except json.JSONDecodeError:
			return JsonResponse({'success': False, 'message': 'Invalid JSON'})
		except Exception as e:
			return JsonResponse({'success': False, 'message': str(e)})

	return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=405)
