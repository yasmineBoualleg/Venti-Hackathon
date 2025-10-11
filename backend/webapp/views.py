from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from api import models, services
from django.utils import timezone

@login_required
def student_dashboard_view(request):
    """
    Student dashboard view
    Shows user profile and their clubs
    """
    dashboard_data = services.get_student_dashboard_data(request.user)
    fake_data = services.get_fake_dashboard_data()
    
    context = {
        'user': request.user,
        **dashboard_data,
        **fake_data,
    }
    
    return render(request, 'student_dashboard.html', context)


@login_required
def club_dashboard_view(request, club_id):
    """
    Club dashboard view for development testing
    Shows club details and chat interface
    """
    dashboard_data = services.get_club_dashboard_data(request.user, club_id)
    
    context = {
        'user': request.user,
        **dashboard_data,
    }
    
    return render(request, 'club_dashboard.html', context)


@login_required
def clubs_listing_view(request):
    """
    Clubs listing page - shows all available clubs
    """
    listing_data = services.get_clubs_listing_data(request.user)
    
    context = {
        'user': request.user,
        **listing_data,
    }
    
    return render(request, 'clubs_listing.html', context)


@login_required
def club_events_view(request):
    """
    Club events listing page
    """
    events_data = services.get_club_events_data(request.user)
    
    context = {
        'user': request.user,
        **events_data,
    }
    
    return render(request, 'club_events.html', context)


@login_required
def create_club_view(request):
    """
    Create club form view
    """
    if request.method == 'POST':
        name = request.POST.get('name')
        description = request.POST.get('description')
        
        if name and description:
            club = services.create_club(request.user, name, description)
            return redirect('club_dashboard', club_id=club.id)
    
    return render(request, 'create_club.html')


def chat_view(request):
    """
    View function for the chat interface
    """
    return render(request, 'chat.html')


def landing_page_view(request):
    """
    Landing page view
    """
    return render(request, 'landing.html')


from rest_framework_simplejwt.tokens import RefreshToken

@login_required
def social_auth_callback_view(request):
    refresh = RefreshToken.for_user(request.user)
    access = refresh.access_token
    return redirect(f'http://localhost:3000/auth/callback?access_token={str(access)}&refresh_token={str(refresh)}')

