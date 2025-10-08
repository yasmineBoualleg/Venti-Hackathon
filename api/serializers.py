from rest_framework import serializers
from . import models


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.User
        fields = ['id', 'username', 'email', 'xp_points']


class UserDashboardSerializer(serializers.ModelSerializer):
    clubs = serializers.SerializerMethodField()
    
    class Meta:
        model = models.User
        fields = ['id', 'username', 'email', 'xp_points', 'clubs', 'date_joined']
    
    def get_clubs(self, obj):
        """Get clubs the user is a member of"""
        memberships = models.ClubMembership.objects.filter(user=obj).select_related('club')
        return [
            {
                'id': membership.club.id,
                'name': membership.club.name,
                'description': membership.club.description,
                'is_admin': membership.club.admin == obj,
                'is_subadmin': membership.is_subadmin,
                'joined_at': membership.joined_at,
                'chat_websocket_url': f"/ws/chat/{membership.club.id}/"
            }
            for membership in memberships
        ]


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
