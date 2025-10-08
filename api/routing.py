from django.urls import path, re_path
from . import consumers

websocket_urlpatterns = [
    # Default chat room (no room name required)
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
    # Named chat rooms
    re_path(r'ws/chat/(?P<room_name>\w+)/$', consumers.ChatConsumer.as_asgi()),
]