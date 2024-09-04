from django.http import JsonResponse
from .models import Profile
from django.db.models import F, ExpressionWrapper, FloatField, Case, When, Value

def leaderboard_win_rate(request):
    profiles = Profile.objects.all()

    profiles = profiles.annotate(
        win_ratio=Case(
            When(gamesPlayed=0, then=Value(0.0)),
            default=ExpressionWrapper(
                F('gamesWon') * 1.0 / F('gamesPlayed'),
                output_field=FloatField()
            )
        )
    )

    profiles = profiles.order_by('-win_ratio')

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

    return JsonResponse(leaderboard_data, safe=False)
