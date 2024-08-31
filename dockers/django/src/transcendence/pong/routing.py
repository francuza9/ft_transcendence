from django.urls import re_path
from . import consumers_pong
from . import consumers_lobby
from . import consumers_global
from . import consumers_tournament

websocket_urlpatterns = [
    re_path(r'^ws/pong/(?P<lobbyId>[a-zA-Z0-9]+)/$', consumers_pong.PongConsumer.as_asgi()),
	re_path(r'^ws/tournament/(?P<lobbyId>[a-zA-Z0-9]+)/$', consumers_tournament.TournamentConsumer.as_asgi()),
	re_path(r'^ws/(?P<lobbyId>[a-zA-Z0-9]+)$', consumers_lobby.LobbyConsumer.as_asgi()),
	re_path(r'^ws/chat/$', consumers_global.GlobalConsumer.as_asgi()),

]