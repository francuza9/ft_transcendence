from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'^ws/pong/(?P<roomId>\d+)/$', consumers.PongConsumer.as_asgi()),
	# re_path(r'^ws/pong/1/$', consumers.PongConsumer.as_asgi()),
	re_path(r'ws/register/$', consumers.RegisterConsumer.as_asgi()),
	re_path(r'^ws/test/$', consumers.EchoConsumer.as_asgi()),
]
