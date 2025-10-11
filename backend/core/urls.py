
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('', include('webapp.urls')),
    path('admin/', admin.site.urls),
    
    # All API endpoints are now under /api/
    path('api/', include('api.urls')),
    
    # Allauth URLs for Google social login initiation
    path('accounts/', include('allauth.urls')),
]