import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Club, ClubMembership, Message
from .serializers import MessageSerializer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"].get("room_name", "general")
        self.room_group_name = f"chat_{self.room_name}"
        self.user = self.scope["user"]
        
        self.is_club_chat = self.room_name.isdigit()
        self.club_id = int(self.room_name) if self.is_club_chat else None
        
        if not self.user.is_authenticated:
            await self.close()
            return
            
        if self.is_club_chat:
            is_member = await self.check_club_membership(self.user, self.club_id)
            if not is_member:
                await self.close()
                return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_text = text_data_json["message"]

        if not self.user.is_authenticated:
            return
            
        message_data = await self.create_chat_message(self.user, message_text)

        if message_data:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": message_data,
                }
            )

    async def chat_message(self, event):
        message = event["message"]
        await self.send(text_data=json.dumps(message))

    @database_sync_to_async
    def create_chat_message(self, user, message_text):
        if not self.is_club_chat:
            return None
        try:
            club = Club.objects.get(id=self.club_id)
            message = Message.objects.create(club=club, author=user, text=message_text)
            return MessageSerializer(message).data
        except Club.DoesNotExist:
            return None

    @database_sync_to_async
    def check_club_membership(self, user, club_id):
        if user.is_superuser:
            return True
        try:
            club = Club.objects.get(id=club_id, is_active=True)
            return ClubMembership.objects.filter(club=club, user=user).exists()
        except Club.DoesNotExist:
            return False