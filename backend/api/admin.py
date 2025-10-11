from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from . import models


@admin.register(models.User)
class UserAdmin(DefaultUserAdmin):
    fieldsets = DefaultUserAdmin.fieldsets + (
        ("Venti", {'fields': ('xp_points',)}),
    )


@admin.register(models.Club)
class ClubAdmin(admin.ModelAdmin):
    list_display = ('name', 'admin')
    # members uses a through model (ClubMembership); use inline if needed


@admin.register(models.ClubMembership)
class ClubMembershipAdmin(admin.ModelAdmin):
    list_display = ('club', 'user', 'is_subadmin', 'joined_at')
    list_filter = ('club', 'is_subadmin')


@admin.register(models.Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('club', 'author', 'created_at')


@admin.register(models.Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('club', 'author', 'created_at')


@admin.register(models.Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'club', 'date')
