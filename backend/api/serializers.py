from rest_framework import serializers
from . import models


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['id', 'username', 'email', 'xp_points']


class ClubSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    members_count = serializers.IntegerField(source='members.count', read_only=True)
    chat_websocket_url = serializers.SerializerMethodField()

    class Meta:
        model = models.Club
        fields = ['id', 'name', 'description', 'admin_username', 'members_count', 'chat_websocket_url']

    def get_chat_websocket_url(self, obj):
        """Generate the WebSocket URL for this club's chat"""
        return f"/ws/chat/{obj.id}/"


class ClubMembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = models.ClubMembership
        fields = ['username', 'email', 'is_subadmin', 'joined_at']


class ClubDetailSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    admin_email = serializers.CharField(source='admin.email', read_only=True)
    members_count = serializers.IntegerField(source='members.count', read_only=True)
    chat_websocket_url = serializers.SerializerMethodField()
    members = ClubMembershipSerializer(source='memberships', many=True, read_only=True)

    class Meta:
        model = models.Club
        fields = ['id', 'name', 'description', 'admin_username', 'admin_email', 
                 'members_count', 'chat_websocket_url', 'members', 'created_at', 'is_active']

    def get_chat_websocket_url(self, obj):
        """Generate the WebSocket URL for this club's chat"""
        return f"/ws/chat/{obj.id}/"


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = models.Post
        fields = ['id', 'club', 'author_username', 'content', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = models.Message
        fields = ['id', 'club', 'author_username', 'text', 'created_at']


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Event
        fields = ['id', 'club', 'title', 'description', 'date']

class ClubMembershipSerializerForDashboard(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name')
    club_id = serializers.IntegerField(source='club.id')

    class Meta:
        model = models.ClubMembership
        fields = ['club_id', 'club_name']

class PostSerializerForDashboard(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username')
    club_name = serializers.CharField(source='club.name')

    class Meta:
        model = models.Post
        fields = ['id', 'club_name', 'author_username', 'content', 'created_at']

class EventSerializerForDashboard(serializers.ModelSerializer):
    club_name = serializers.CharField(source='club.name')

    class Meta:
        model = models.Event
        fields = ['id', 'club_name', 'title', 'description', 'date']

class DashboardSerializer(serializers.Serializer):
    memberships = ClubMembershipSerializerForDashboard(many=True)
    clubs_count = serializers.IntegerField()
    recent_posts = PostSerializerForDashboard(many=True)
    upcoming_events = EventSerializerForDashboard(many=True)