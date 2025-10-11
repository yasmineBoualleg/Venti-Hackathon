from django.urls import path
from . import views

urlpatterns = [
    path('social-auth-callback/', views.social_auth_callback_view, name='social_auth_callback'),
]