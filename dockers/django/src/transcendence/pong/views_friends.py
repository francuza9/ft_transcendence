from django.http import JsonResponse
from .models import CustomUser, Message
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import logging

logger = logging.getLogger(__name__)

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
    
@login_required
@csrf_exempt
def get_friend_requests(request):
	try:
		user = request.user

		friend_requests = user.received_friend_requests.all()
		sent_requests = user.sent_friend_requests.all()
			
		friend_requests_data = []
		for friend_request in friend_requests:
			friend_requests_data.append({
				'username': friend_request.username,
				'name': friend_request.profile.displayName,
				'avatar': friend_request.profile.avatarUrl.url if friend_request.profile.avatarUrl else None,
				})
		sent_requests_data = []
		for sent_request in sent_requests:
			sent_requests_data.append({
				'username': sent_request.username,
				'name': sent_request.profile.displayName,
				'avatar': sent_request.profile.avatarUrl.url if sent_request.profile.avatarUrl else None,
				})
					
		return JsonResponse({'success': True, 'friend_requests': friend_requests_data, 'sent_requests': sent_requests_data}, status=200)

	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)}, status=500)
    
@login_required
@csrf_exempt
def get_blocked(request):
	try:
		user = request.user

		blocked = user.blocked_users.all()

		blocked_data = []
		for block in blocked:
			blocked_data.append({
				'username': block.username,
				'name': block.profile.displayName,
				'avatar': block.profile.avatarUrl.url if block.profile.avatarUrl else None,
				})

		return JsonResponse({'success': True, 'blocked': blocked_data}, status=200)

	except Exception as e:
		return JsonResponse({'success': False, 'error': str(e)}, status=500)


@login_required
@csrf_exempt
def get_messages(request, username):
    try:
        user = request.user
        friend = CustomUser.objects.get(username=username)
        if (friend not in user.friends.all()):
            raise Exception("You are not friends with this user")
        messages = Message.objects.filter(
                Q(sender=user, recipient=friend) | Q(sender=friend, recipient=user)
                ).order_by('createdAt')

        messages_data = []
        for message in messages:
            messages_data.append({
                'sender': message.sender.username,
                'recipient': message.recipient.username,
                'timestamp': message.createdAt,
                'content': message.content,
                })

        logger.info(messages_data)

        return JsonResponse({'success': True, 'messages': messages_data}, status=200)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
