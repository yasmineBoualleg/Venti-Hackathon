from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken

@login_required
def get_jwt_for_social_auth(request):
    refresh = RefreshToken.for_user(request.user)
    return JsonResponse({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from . import models, serializers, services
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.db.models import F
from django.shortcuts import render, redirect


def signup_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")

        user = models.User.objects.create_user(username=username, email=email, password=password)
        return redirect("dashboard")  # or wherever you want

    return render(request, "signup.html")

class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        if not username or not password:
            return Response({'detail': 'username and password required'}, status=status.HTTP_400_BAD_REQUEST)
        if models.User.objects.filter(username=username).exists():
            return Response({'detail': 'username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        user = models.User(username=username, email=email)
        user.set_password(password)
        user.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': serializers.UserSerializer(user).data})


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.User.objects.all()
    serializer_class = serializers.UserSerializer

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def memberships(self, request, pk=None):
        user = self.get_object()
        # Ensure the requesting user can only see their own memberships unless they are a superuser
        if request.user.is_superuser or request.user == user:
            memberships = models.ClubMembership.objects.filter(user=user)
            # We want to return the clubs, not the membership objects directly
            clubs = [membership.club for membership in memberships]
            serializer = serializers.ClubSerializer(clubs, many=True, context={'request': request})
            return Response(serializer.data)
        return Response({'detail': 'You do not have permission to view these memberships.'}, status=status.HTTP_403_FORBIDDEN)


class IsClubAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.admin == request.user or request.user.is_superuser

class IsClubMemberOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.members.filter(id=request.user.id).exists() or request.user.is_superuser


class ClubViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsClubAdminOrReadOnly]
    serializer_class = serializers.ClubSerializer
    
    def get_serializer_class(self):
        """Use detailed serializer for individual club retrieval"""
        if self.action == 'retrieve':
            return serializers.ClubDetailSerializer
        return serializers.ClubSerializer

    def get_queryset(self):
        # For list action: regular users see active clubs, superusers see all
        if self.action == 'list' and not self.request.user.is_superuser:
            return models.Club.objects.filter(is_active=True)
        # For other actions: superusers see all, others see active
        if self.request.user.is_superuser:
            return models.Club.objects.all()
        return models.Club.objects.filter(is_active=True)

    def perform_create(self, serializer):
        club = services.create_club(self.request.user, serializer.validated_data)
        services.send_club_creation_notification(club, self.request.user)
        
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        """List all pending clubs. Only superusers can see this."""
        pending_clubs = models.Club.objects.filter(is_active=False, rejected_reason__isnull=True)
        page = self.paginate_queryset(pending_clubs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(pending_clubs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a pending club. Only superusers can do this."""
        club = self.get_object()
        club.is_active = True
        club.approved_date = timezone.now()
        club.save()
        send_mail(
            f'Club "{club.name}" Approved',
            'Your club has been approved.',
            settings.DEFAULT_FROM_EMAIL,
            [club.admin.email],
            fail_silently=True
        )
        return Response({'detail': 'Club approved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a pending club. Only superusers can do this."""
        club = self.get_object()
        reason = request.data.get('reason', 'No reason provided.')
        club.rejected_reason = reason
        club.rejection_date = timezone.now()
        club.is_active = False
        club.save()
        send_mail(
            f'Club "{club.name}" Rejected',
            f'Your club has been rejected. Reason: {reason}',
            settings.DEFAULT_FROM_EMAIL,
            [club.admin.email],
            fail_silently=True
        )
        return Response({'detail': 'Club rejected'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        club = get_object_or_404(models.Club, pk=pk)
        if club.members.filter(id=request.user.id).exists():
            return Response({'detail': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)
        club.members.add(request.user)
        user = request.user
        user.xp_points = F('xp_points') + 5
        user.save(update_fields=['xp_points'])
        user.refresh_from_db()
        return Response({'detail': 'joined', 'xp_points': user.xp_points})


class PostViewSet(viewsets.ModelViewSet):
    queryset = models.Post.objects.all().order_by('-created_at')
    serializer_class = serializers.PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        post = serializer.save(author=self.request.user)
        # increment xp for author
        user = self.request.user
        user.xp_points = F('xp_points') + 10
        user.save(update_fields=['xp_points'])
        user.refresh_from_db()


class MessageViewSet(viewsets.ModelViewSet):
    queryset = models.Message.objects.all().order_by('created_at')
    serializer_class = serializers.MessageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        club_id = self.request.query_params.get('club')
        if club_id:
            queryset = queryset.filter(club_id=club_id)
        return queryset

    def perform_create(self, serializer):
        msg = serializer.save(author=self.request.user)
        user = self.request.user
        user.xp_points = F('xp_points') + 5
        user.save(update_fields=['xp_points'])
        user.refresh_from_db()


class EventViewSet(viewsets.ModelViewSet):
    queryset = models.Event.objects.all().order_by('date')
    serializer_class = serializers.EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Only show upcoming events."""
        now = timezone.now()
        return super().get_queryset().filter(date__gte=now).order_by('date')

    def perform_create(self, serializer):
        """Ensure the user is a member of the club they are creating an event for."""
        club = serializer.validated_data.get('club')
        if not club.members.filter(id=self.request.user.id).exists() and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("You must be a member of the club to create an event.")
        serializer.save()


class StudentDashboardAPIView(APIView):
    """
    API endpoint for student dashboard data
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        dashboard_data = services.get_student_dashboard_data(request.user)
        serializer = serializers.DashboardSerializer(dashboard_data)
        return Response(serializer.data)