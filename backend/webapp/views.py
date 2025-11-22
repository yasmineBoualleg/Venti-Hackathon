from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.generic import TemplateView

class FrontendAppView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        return {
            'user': self.request.user,
        }

from django.conf import settings

@login_required
def social_auth_callback_view(request):
    refresh = RefreshToken.for_user(request.user)
    access = refresh.access_token
    return redirect(f'{settings.FRONTEND_URL}/auth/callback?access_token={str(access)}&refresh_token={str(refresh)}')