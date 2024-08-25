from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import logging

logger = logging.getLogger(__name__)

@login_required
@csrf_exempt
def get_friends(request):
	try:
		# Get the logged-in user
		user = request.user
		logger.info(f"User {user.username} requested friends list")

		# Retrieve the friends of the logged-in user
		friends = user.friends.all()

		# Prepare the data to be returned in the response
		friends_data = []
		for friend in friends:
			# You can add more fields if necessary (e.g. avatar, display name)
			friends_data.append({
				'username': friend.username,
				'displayName': friend.profile.displayName,  # Assuming profile is related
				'avatarUrl': friend.profile.avatarUrl.url if friend.profile.avatarUrl else None,
			})

		# Return the friends data as JSON response
		return JsonResponse({'success': True, 'friends': friends_data}, status=200)

	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)}, status=500)