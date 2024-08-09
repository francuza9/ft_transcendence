from django.urls import re_path
from . import consumers_pong


websocket_urlpatterns = [
    re_path(r'^ws/pong/(?P<roomId>\d+)/$', consumers_pong.PongConsumer.as_asgi()),
]