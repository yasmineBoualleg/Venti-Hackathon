from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from api import models
from django.utils import timezone


def landing_view(request):
    """Landing page view"""
    return render(request, 'landing.html')


@login_required
def student_dashboard_view(request):
    """
    Student dashboard view
    Shows user profile and their clubs
    """
    # Get user's clubs
    memberships = models.ClubMembership.objects.filter(user=request.user).select_related('club')
    
    # Get recent posts from user's clubs
    user_clubs = [membership.club for membership in memberships]
    recent_posts = models.Post.objects.filter(club__in=user_clubs).select_related('author', 'club').order_by('-created_at')[:5]
    
    # Get upcoming events from user's clubs
    upcoming_events = models.Event.objects.filter(club__in=user_clubs, date__gte=timezone.now()).order_by('date')[:3]
    
    # Create some fake Algerian clubs data for demonstration
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
    
    # Create fake posts data
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
    
    context = {
        'user': request.user,
        'memberships': memberships,
        'clubs_count': memberships.count(),
        'recent_posts': recent_posts,
        'upcoming_events': upcoming_events,
        'fake_clubs_data': fake_clubs_data,
        'fake_posts_data': fake_posts_data,
    }
    
    return render(request, 'student_dashboard.html', context)


@login_required
def club_dashboard_view(request, club_id):
    """
    Club dashboard view for development testing
    Shows club details and chat interface
    """
    from django.shortcuts import get_object_or_404
    
    club = get_object_or_404(models.Club, id=club_id, is_active=True)
    
    # Check if user is a member, admin, or superuser
    is_member = False
    is_admin = False
    is_superuser = False
    
    if request.user.is_authenticated:
        is_superuser = request.user.is_superuser
        is_admin = club.admin == request.user
        is_member = club.members.filter(id=request.user.id).exists()
        
        # Superusers can see everything
        if is_superuser:
            is_member = True  # Treat superusers as members for chat access
    
    context = {
        'club': club,
        'is_member': is_member,
        'is_admin': is_admin,
        'is_superuser': is_superuser,
        'websocket_url': f'/ws/chat/{club_id}/',
        'user': request.user
    }
    
    return render(request, 'club_dashboard.html', context)


@login_required
def clubs_listing_view(request):
    """
    Clubs listing page - shows all available clubs
    """
    # Get all active clubs
    clubs = models.Club.objects.filter(is_active=True).prefetch_related('members')
    
    # Get user's memberships
    user_memberships = models.ClubMembership.objects.filter(user=request.user).select_related('club')
    user_club_ids = [membership.club.id for membership in user_memberships]
    
    context = {
        'clubs': clubs,
        'user_memberships': user_memberships,
        'user_club_ids': user_club_ids,
        'user': request.user,
    }
    
    return render(request, 'clubs_listing.html', context)


@login_required
def club_events_view(request):
    """
    Club events listing page
    """
    # Get upcoming events from user's clubs
    user_memberships = models.ClubMembership.objects.filter(user=request.user).select_related('club')
    user_clubs = [membership.club for membership in user_memberships]
    upcoming_events = models.Event.objects.filter(club__in=user_clubs, date__gte=timezone.now()).order_by('date')
    
    context = {
        'events': upcoming_events,
        'user_clubs': user_clubs,
        'user': request.user,
    }
    
    return render(request, 'club_events.html', context)


@login_required
def create_club_view(request):
    """
    Create club form view
    """
    if request.method == 'POST':
        # Handle club creation
        name = request.POST.get('name')
        description = request.POST.get('description')
        
        if name and description:
            club = models.Club.objects.create(
                name=name,
                description=description,
                admin=request.user,
                is_active=True
            )
            # Add creator as first member
            models.ClubMembership.objects.create(club=club, user=request.user)
            club.members.add(request.user)
            
            return redirect('club_dashboard', club_id=club.id)
    
    return render(request, 'create_club.html')


def chat_view(request):
    """
    View function for the chat interface
    """
    return render(request, 'chat.html')

