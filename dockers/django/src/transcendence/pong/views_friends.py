from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

# Mock data for demonstration
friends_data = [
    {"name": "Alice", "avatar": "/static/src/images/alice.png"},
    {"name": "Bob", "avatar": "/static/src/images/bob.png"},
    # Add more friends as needed
]

@csrf_exempt
@require_POST
def get_friends(request):
    # In a real application, you would query the database for friends of the current user
    return JsonResponse({"friends": friends_data})
