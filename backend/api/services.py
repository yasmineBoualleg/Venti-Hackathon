from . import models
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import F

def get_student_dashboard_data(user):
    """
    Get the data for the student dashboard.
    """
    memberships = models.ClubMembership.objects.filter(user=user).select_related('club')
    user_clubs = [membership.club for membership in memberships]
    recent_posts = models.Post.objects.filter(club__in=user_clubs).select_related('author', 'club').order_by('-created_at')[:5]
    upcoming_events = models.Event.objects.filter(club__in=user_clubs, date__gte=timezone.now()).order_by('date')[:3]

    return {
        'memberships': memberships,
        'clubs_count': memberships.count(),
        'recent_posts': recent_posts,
        'upcoming_events': upcoming_events,
    }

def get_fake_dashboard_data():
    """
    Get fake data for the student dashboard.
    """
    fake_clubs_data = [
        {
            'name': 'IEEE Student Branch Algiers',
            'description': 'Technology & Engineering',
            'member_count': 245,
            'logo': 'IEEE'
        },
        {
            'name': 'Computer Science Club USTHB',
            'description': 'Programming & Development',
            'member_count': 189,
            'logo': 'CS'
        },
        {
            'name': 'AI & Machine Learning Algeria',
            'description': 'Artificial Intelligence Research',
            'member_count': 156,
            'logo': 'AI'
        }
    ]
    
    fake_posts_data = [
        {
            'author': 'IEEE Algiers',
            'content': 'Techstars Startup Weekend Algiers - Women in Tech Edition',
            'date': 'Jul 25',
            'likes': 12,
            'club': 'IEEE'
        },
        {
            'author': 'GOMYCODE DZ',
            'content': 'LLMS & GenAI Certification Program - Limited Time Offer!',
            'date': 'Jul 15',
            'likes': 15,
            'club': 'GOMYCODE'
        },
        {
            'author': 'CS Club USTHB',
            'content': 'New Programming Workshop: React & Node.js',
            'date': 'Jul 10',
            'likes': 8,
            'club': 'CS'
        }
    ]

    return {
        'fake_clubs_data': fake_clubs_data,
        'fake_posts_data': fake_posts_data,
    }

def get_club_dashboard_data(user, club_id):
    """
    Get the data for the club dashboard.
    """
    club = get_object_or_404(models.Club, id=club_id, is_active=True)
    
    is_member = False
    is_admin = False
    is_superuser = False
    
    if user.is_authenticated:
        is_superuser = user.is_superuser
        is_admin = club.admin == user
        is_member = club.members.filter(id=user.id).exists()
        
        if is_superuser:
            is_member = True
    
    return {
        'club': club,
        'is_member': is_member,
        'is_admin': is_admin,
        'is_superuser': is_superuser,
        'websocket_url': f'/ws/chat/{club_id}/',
    }

def get_clubs_listing_data(user):
    """
    Get the data for the clubs listing page.
    """
    clubs = models.Club.objects.filter(is_active=True).prefetch_related('members')
    user_memberships = models.ClubMembership.objects.filter(user=user).select_related('club')
    user_club_ids = [membership.club.id for membership in user_memberships]
    
    return {
        'clubs': clubs,
        'user_memberships': user_memberships,
        'user_club_ids': user_club_ids,
    }

def get_club_events_data(user):
    """
    Get the data for the club events page.
    """
    user_memberships = models.ClubMembership.objects.filter(user=user).select_related('club')
    user_clubs = [membership.club for membership in user_memberships]
    upcoming_events = models.Event.objects.filter(club__in=user_clubs, date__gte=timezone.now()).order_by('date')
    
    return {
        'events': upcoming_events,
        'user_clubs': user_clubs,
    }

def create_club(user, validated_data):
    """
    Create a new club.
    """
    is_active = True if user.is_superuser else False
    club = models.Club.objects.create(
        admin=user,
        is_active=is_active,
        **validated_data
    )
    if is_active:
        club.approved_date = timezone.now()
        club.save()
        
    # Add creator as first member
    models.ClubMembership.objects.get_or_create(club=club, user=user)
    
    return club

def send_club_creation_notification(club, creator):
    """
    Send notification email to admins if club needs approval.
    """
    if not club.is_active:
        superusers = models.User.objects.filter(is_superuser=True)
        send_mail(
            subject=f'New Club Pending Approval: {club.name}',
            message=f'A new club "{club.name}" has been created by {creator.username} and needs approval.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[u.email for u in superusers if u.email],
            fail_silently=True
        )

def send_approval_email(club):
    """
    Send approval email to club admin.
    """
    send_mail(
        subject=f'Your Club "{club.name}" has been approved!',
        message=f'Congratulations! Your club "{club.name}" has been approved and is now active.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[club.admin.email],
        fail_silently=True
    )

def send_rejection_email(club, reason):
    """
    Send rejection email to club admin.
    """
    send_mail(
        subject=f'Your Club "{club.name}" was not approved',
        message=f'Unfortunately, your club "{club.name}" was not approved.\n\nReason: {reason}',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[club.admin.email],
        fail_silently=True
    )

def approve_club(club):
    """
    Approve a pending club.
    """
    if club.is_active:
        return False, 'Club is already active'
    
    club.is_active = True
    club.approved_date = timezone.now()
    club.save(update_fields=['is_active', 'approved_date'])
    
    send_approval_email(club)
    
    return True, 'Club approved successfully'

def reject_club(club, reason):
    """
    Reject a pending club.
    """
    if club.is_active:
        return False, 'Cannot reject an active club'
    
    if not reason:
        return False, 'Rejection reason is required'
        
    club.rejected_reason = reason
    club.rejection_date = timezone.now()
    club.save()
    
    send_rejection_email(club, reason)
    
    return True, 'Club rejected'

def join_club(club, user):
    """
    Join a club.
    """
    if club.members.filter(id=user.id).exists():
        return False, 'Already a member'
    
    membership, _ = models.ClubMembership.objects.get_or_create(club=club, user=user)
    membership.is_subadmin = membership.is_subadmin or False
    membership.save()
    club.members.add(user)
    
    user.xp_points = F('xp_points') + 5
    user.save(update_fields=['xp_points'])
    user.refresh_from_db()
    
    return True, 'joined'

def leave_club(club, user):
    """
    Leave a club.
    """
    if not club.members.filter(id=user.id).exists():
        return False, 'Not a member'
    
    if user == club.admin:
        return False, 'Club admin cannot leave. Transfer admin role first.'
    
    club.members.remove(user)
    models.ClubMembership.objects.filter(club=club, user=user).delete()
    
    return True, 'left'

def kick_member(club, user_to_kick):
    """
    Kick a member from a club.
    """
    if not club.members.filter(id=user_to_kick.id).exists():
        return False, 'Not a member'
        
    if user_to_kick == club.admin:
        return False, 'Cannot kick the club admin'
        
    club.members.remove(user_to_kick)
    models.ClubMembership.objects.filter(club=club, user=user_to_kick).delete()
    
    return True, 'Member kicked'

def set_subadmin(club, user, is_subadmin):
    """
    Set or remove subadmin status for a user in a club.
    """
    membership, _ = models.ClubMembership.objects.get_or_create(club=club, user=user)
    membership.is_subadmin = is_subadmin
    membership.save()
    
    return membership

def set_admin(club, new_admin):
    """
    Set a new admin for the club.
    """
    club.admin = new_admin
    club.save()
    
    # Ensure the new admin is a member
    models.ClubMembership.objects.get_or_create(club=club, user=new_admin)
    
    return club