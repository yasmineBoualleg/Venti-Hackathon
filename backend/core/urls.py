from django.contrib import admin
from django.urls import path, include, re_path
from webapp.views import FrontendAppView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # API routes
    path('api/', include('api.urls')),

    # Django Allauth routes for social authentication flow
    path('accounts/', include('allauth.urls')),

    # Custom view to handle the callback from social auth and redirect to React with tokens
    path('', include('webapp.urls')),

    # Catch-all route to serve the React application.
    # This must be the LAST pattern in the list.
    re_path(r'^.*$', FrontendAppView.as_view(), name='app'),
]