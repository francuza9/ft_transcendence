from django.urls import re_path
from . import consumers_login
from . import consumers_pong


websocket_urlpatterns = [
    re_path(r'^ws/pong/(?P<roomId>\d+)/$', consumers_pong.PongConsumer.as_asgi()),
	# re_path(r'^ws/pong/1/$', consumers.PongConsumer.as_asgi()),
	re_path(r'ws/register/$', consumers_login.RegisterConsumer.as_asgi()),
]
