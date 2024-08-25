from django.http import JsonResponse
from .models import Profile
from django.db.models import F, ExpressionWrapper, FloatField, Case, When, Value

def leaderboard_win_rate(request):
    # Get all profiles
    profiles = Profile.objects.all()

    # Annotate each profile with the win ratio
    profiles = profiles.annotate(
        win_ratio=Case(
            When(gamesPlayed=0, then=Value(0.0)),
            default=ExpressionWrapper(
                F('gamesWon') * 1.0 / F('gamesPlayed'),
                output_field=FloatField()
            )
        )
    )

    # Sort profiles by win ratio in descending order
    profiles = profiles.order_by('-win_ratio')

    # Prepare the leaderboard data
    leaderboard_data = []
    for profile in profiles:
        leaderboard_data.append({
            'username': profile.user.username,
            'avatarUrl': profile.avatarUrl.url if profile.avatarUrl else None,
            'displayName': profile.displayName,
            'gamesPlayed': profile.gamesPlayed,
            'gamesWon': profile.gamesWon,
            'win_ratio': profile.win_ratio,
        })

    # Return the data as a JSON response
    return JsonResponse(leaderboard_data, safe=False)