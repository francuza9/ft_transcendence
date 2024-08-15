from django.urls import re_path
from . import consumers_pong
from . import consumers_lobby


websocket_urlpatterns = [
    re_path(r'^ws/pong/(?P<roomId>\d+)$', consumers_pong.PongConsumer.as_asgi()),
	re_path(r'^ws/(?P<lobbyId>[a-zA-Z0-9]+)$', consumers_lobby.LobbyConsumer.as_asgi()),
]