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
def get_messages(request, username):
    try:
        user = request.user
        friend = CustomUser.objects.get(username=username)
        if (friend not in user.friends.all()):
            raise Exception("You are not friends with this user")
        messages = Message.objects.filter(
                Q(sender=user, recipient=friend) | Q(sender=friend, recipient=user)
                ).order_by('timestamp')

        messages_data = []
        for message in messages:
            messages_data.append({
                'sender': message.sender.username,
                'recipient': message.recipient.username,
                'timestamp': message.timestamp,
                'content': message.content,
                })

        logger.info(messages_data)

        return JsonResponse({'success': True, 'messages': messages_data}, status=200)

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
