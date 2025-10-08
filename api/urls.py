from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'clubs', views.ClubViewSet, basename='club')
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'messages', views.MessageViewSet, basename='message')
router.register(r'events', views.EventViewSet, basename='event')

urlpatterns = [
    # API endpoints only - JSON responses
    path('users/', include(router.urls)),
    path('clubs/', include(router.urls)),
    path('posts/', include(router.urls)),
    path('messages/', include(router.urls)),
    path('events/', include(router.urls)),
    
    # API authentication endpoints
    path('auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('auth/token/', obtain_auth_token, name='api_token_auth'),
    path('auth/register/', views.RegisterAPIView.as_view(), name='api_register'),
    
    # API data endpoints
    path('dashboard/', views.StudentDashboardAPIView.as_view(), name='student_dashboard_api'),
]
