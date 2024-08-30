from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

@login_required
@csrf_exempt
def get_friends(request):
	try:
		user = request.user
		
		friends = user.friends.all()

		friends_data = []
		for friend in friends:
			friends_data.append({
				'username': friend.username,
				'name': friend.profile.displayName,
				'avatar': friend.profile.avatarUrl.url if friend.profile.avatarUrl else None,
			})

		return JsonResponse({'success': True, 'friends': friends_data}, status=200)

	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)}, status=500)
