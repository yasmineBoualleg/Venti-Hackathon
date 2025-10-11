# backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'clubs', views.ClubViewSet, basename='club')
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'messages', views.MessageViewSet, basename='message')
router.register(r'events', views.EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
    
    # User registration
    path('register/', views.RegisterAPIView.as_view(), name='api_register'),

    # JWT Authentication endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/social/token/', views.get_jwt_for_social_auth, name='social_token'),
    
    
    # Dashboard data endpoint
    path('dashboard/', views.StudentDashboardAPIView.as_view(), name='student_dashboard_api'),
]