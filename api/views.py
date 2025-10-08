
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from . import models, serializers
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework import permissions
from django.db.models import F
from django.shortcuts import render
def signup_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")

        user = User.objects.create_user(username=username, email=email, password=password)
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

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def set_password(self, request, pk=None):
        # allow change if requester is superuser OR shares a club membership with the target user OR is club admin/subadmin
        target = self.get_object()
        requester = request.user
        new_password = request.data.get('password')
        if not new_password:
            return Response({'detail': 'password required'}, status=status.HTTP_400_BAD_REQUEST)

        # superuser can always change
        if requester.is_superuser:
            target.set_password(new_password)
            target.save()
            return Response({'detail': 'password updated by superuser'})

        # check shared club membership where requester is member/subadmin/admin
        clubs_shared = models.Club.objects.filter(members=requester).filter(members=target)
        if clubs_shared.exists():
            target.set_password(new_password)
            target.save()
            return Response({'detail': 'password updated'})

        return Response({'detail': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)


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
        # If creator is superuser, auto-approve the club
        is_active = True if self.request.user.is_superuser else False
        club = serializer.save(
            admin=self.request.user,
            is_active=is_active
        )
        if is_active:
            club.approved_date = timezone.now()
            club.save()
        
        # Add creator as first member
        models.ClubMembership.objects.get_or_create(club=club, user=self.request.user)
        
        # Send notification email to admins if club needs approval
        if not is_active:
            superusers = models.User.objects.filter(is_superuser=True)
            send_mail(
                subject=f'New Club Pending Approval: {club.name}',
                message=f'A new club "{club.name}" has been created by {self.request.user.username} and needs approval.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[u.email for u in superusers if u.email],
                fail_silently=True
            )
        
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        """List all pending clubs. Only superusers can see this."""
        pending_clubs = models.Club.objects.filter(is_active=False, rejected_reason__isnull=True)
        page = self.paginate_queryset(pending_clubs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(pending_clubs, many=True)
        return Response({
            'count': pending_clubs.count(),
            'results': serializer.data
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a pending club. Only superusers can do this."""
        club = self.get_object()
        
        if club.is_active:
            return Response({
                'detail': 'Club is already active'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        club.is_active = True
        club.approved_date = timezone.now()
        club.save(update_fields=['is_active', 'approved_date'])
      
        # Send approval email to club admin
        send_mail(
            subject=f'Your Club "{club.name}" has been approved!',
            message=f'Congratulations! Your club "{club.name}" has been approved and is now active.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[club.admin.email],
            fail_silently=True
        )
        
        return Response({
            'detail': 'Club approved successfully',
            'club': club.name,
            'id': club.id,
            'admin': club.admin.username,
            'approved_date': club.approved_date,
            'description' : club.description,
            'is_active': club.is_active,
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a pending club. Only superusers can do this."""
        club = self.get_object()
        reason = request.data.get('reason', '')
        
        if club.is_active:
            return Response({
                'detail': 'Cannot reject an active club'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not reason:
            return Response({
                'detail': 'Rejection reason is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        club.rejected_reason = reason
        club.rejection_date = timezone.now()
        club.save()
        
        # Send rejection email to club admin
        send_mail(
            subject=f'Your Club "{club.name}" was not approved',
            message=f'Unfortunately, your club "{club.name}" was not approved.\n\nReason: {reason}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[club.admin.email],
            fail_silently=True
        )
        
        return Response({
            'detail': 'Club rejected',
            'club': club.name,
            'reason': reason,
            'rejection_date': club.rejection_date
        })

    def get_permissions(self):
        if self.action in ['join']:
            return [permissions.IsAuthenticated()]
        elif self.action in ['leave']:
            return [permissions.IsAuthenticated(), IsClubMemberOrReadOnly()]
        elif self.action in ['kick_member']:
            return [permissions.IsAuthenticated(), IsClubAdminOrReadOnly()]
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        club = self.get_object()
        user = request.user
        if club.members.filter(id=user.id).exists():
            return Response({'detail': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)
        # create membership and add to m2m
        membership, _ = models.ClubMembership.objects.get_or_create(club=club, user=user)
        membership.is_subadmin = membership.is_subadmin or False
        membership.save()
        club.members.add(user)
        # increment xp atomically
        user.xp_points = F('xp_points') + 5
        user.save(update_fields=['xp_points'])
        user.refresh_from_db()
        return Response({
            'detail': 'joined',
            'club': club.name,
            'xp_points': user.xp_points
        })

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        club = self.get_object()
        user = request.user
        if not club.members.filter(id=user.id).exists():
            return Response({'detail': 'Not a member'}, status=status.HTTP_400_BAD_REQUEST)
        if user == club.admin:
            return Response(
                {'detail': 'Club admin cannot leave. Transfer admin role first.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        club.members.remove(user)
        models.ClubMembership.objects.filter(club=club, user=user).delete()
        return Response({
            'detail': 'left',
            'club': club.name
        })

    @action(detail=True, methods=['post'])
    def kick_member(self, request, pk=None):
        club = self.get_object()
        username = request.data.get('username')
        if not username:
            return Response({'detail': 'Username required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = models.User.objects.get(username=username)
        except models.User.DoesNotExist:
            return Response({'detail': f"User '{username}' not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if not club.members.filter(id=user.id).exists():
            return Response({'detail': 'Not a member'}, status=status.HTTP_400_BAD_REQUEST)
            
        if user == club.admin:
            return Response(
                {'detail': 'Cannot kick the club admin'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        club.members.remove(user)
        models.ClubMembership.objects.filter(club=club, user=user).delete()
        return Response({
            'detail': 'Member kicked',
            'club': club.name,
            'kicked_user': username
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def set_subadmin(self, request, pk=None):
        # only club admin can set/remove subadmins
        club = self.get_object()
        requester = request.user
        if club.admin != requester and not requester.is_superuser:
            return Response({'detail': 'only club admin can set subadmins'}, status=status.HTTP_403_FORBIDDEN)
        username = request.data.get('username')
        is_subadmin = bool(request.data.get('is_subadmin', True))
        try:
            user = models.User.objects.get(username=username)
        except models.User.DoesNotExist:
            return Response({'detail': 'user not found'}, status=status.HTTP_404_NOT_FOUND)
        membership, _ = models.ClubMembership.objects.get_or_create(club=club, user=user)
        membership.is_subadmin = is_subadmin
        membership.save()
        return Response({'detail': 'subadmin set', 'user': user.username, 'is_subadmin': membership.is_subadmin})

    @action(detail=True, methods=['post', 'get'], permission_classes=[permissions.IsAdminUser])
    def set_admin(self, request, pk=None):
        """Set a new admin for the club. Only superusers can do this.
        GET shows the form, POST processes it."""
        club = self.get_object()
        
        if request.method == 'GET':
            # Return a form-friendly response showing just the username field
            return Response({
                'instructions': 'Enter the username of the new club admin',
                'current_admin': club.admin.username,
                'method': 'POST',
                'fields': {
                    'new_admin_username': {
                        'type': 'string',
                        'required': True,
                        'label': 'Set new admin to'
                    }
                }
            })
        
        # Handle POST - process the admin change
        new_admin_username = request.data.get('new_admin_username')
        if not new_admin_username:
            return Response(
                {'detail': 'new_admin_username is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            new_admin = models.User.objects.get(username=new_admin_username)
        except models.User.DoesNotExist:
            return Response(
                {'detail': f"User '{new_admin_username}' not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Update the club admin
        club.admin = new_admin
        club.save()
        
        # Ensure the new admin is a member
        models.ClubMembership.objects.get_or_create(club=club, user=new_admin)
        
        return Response({
            'detail': 'Club admin changed successfully',
            'club': club.name,
            'new_admin': new_admin.username
        })


class PostViewSet(viewsets.ModelViewSet):
    queryset = models.Post.objects.all().order_by('-created_at')
    serializer_class = serializers.PostSerializer

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

    def get_permissions(self):
        if self.action in ['create']:
            return [IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        msg = serializer.save(author=self.request.user)
        user = self.request.user
        user.xp_points = F('xp_points') + 10
        user.save(update_fields=['xp_points'])
        user.refresh_from_db()


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = models.Event.objects.all().order_by('date')
    serializer_class = serializers.EventSerializer

    def get_queryset(self):
        # only upcoming events
        from django.utils import timezone

        now = timezone.now()
        return super().get_queryset().filter(date__gte=now).order_by('date')


class StudentDashboardAPIView(APIView):
    """
    API endpoint for student dashboard data
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = serializers.UserDashboardSerializer(request.user)
        return Response(serializer.data)
