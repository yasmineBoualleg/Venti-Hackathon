import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import Club, ClubMembership

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get room name from URL kwargs, default to 'general' if not provided
        self.room_name = self.scope["url_route"]["kwargs"].get("room_name", "general")
        self.room_group_name = f"chat_{self.room_name}"
        
        # Check if this is a club-specific chat
        self.is_club_chat = self.room_name.isdigit()
        self.club_id = int(self.room_name) if self.is_club_chat else None
        
        # Check permissions for club chats
        if self.is_club_chat:
            user = self.scope["user"]
            if isinstance(user, AnonymousUser):
                await self.close()
                return
                
            # Check if user is a member of the club
            is_member = await self.check_club_membership(user, self.club_id)
            if not is_member:
                await self.close()
                return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        sender = text_data_json.get("sender", "Anonymous")
        timestamp = text_data_json.get("timestamp", "")

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": sender,
                "timestamp": timestamp,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "sender": event.get("sender", "Anonymous"),
            "timestamp": event.get("timestamp", "")
        }))

    @database_sync_to_async
    def check_club_membership(self, user, club_id):
        """Check if user is a member of the specified club or is a superuser"""
        try:
            # Superusers have access to all club chats
            if user.is_superuser:
                return True
                
            club = Club.objects.get(id=club_id, is_active=True)
            return ClubMembership.objects.filter(club=club, user=user).exists()
        except Club.DoesNotExist:
            return False
