
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from frontend.views import (
    landing_view, student_dashboard_view, club_dashboard_view,
    clubs_listing_view, club_events_view, create_club_view, chat_view
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints (JSON only)
    path('api/', include('api.urls')),
    
    # Authentication
    path('accounts/', include('allauth.urls')),
    
    # Frontend views (HTML templates)
    path('', landing_view, name='landing'),
    path('students/dashboard/', student_dashboard_view, name='student_dashboard'),
    path('clubs/', clubs_listing_view, name='club_list'),
    path('clubs/create/', create_club_view, name='club_create'),
    path('clubs/<int:club_id>/dashboard/', club_dashboard_view, name='club_dashboard'),
    path('events/', club_events_view, name='club_events'),
    path('chat/', chat_view, name='chat'),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
