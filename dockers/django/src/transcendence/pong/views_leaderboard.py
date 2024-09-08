from django.http import JsonResponse
from .models import CustomUser, Profile, Game
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

def match_history(request, username):
    try:
        user = CustomUser.objects.get(username=username)
        
        games_as_player1 = Game.objects.filter(player1=user)
        games_as_player2 = Game.objects.filter(player2=user)
        
        games = games_as_player1.union(games_as_player2).order_by('-createdAt')
        
        match_history_data = []
        for game in games:
            match_history_data.append({
                'player1': game.player1.username,
                'player2': game.player2.username,
                'winner': game.winner.username if game.winner else None,
                'player1Score': game.player1Score,
                'player2Score': game.player2Score,
                'date': game.createdAt.strftime('%Y-%m-%d %H:%M:%S'),
            })

        return JsonResponse(match_history_data, safe=False, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
