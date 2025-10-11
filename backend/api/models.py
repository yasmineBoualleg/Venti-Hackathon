from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    xp_points = models.IntegerField(default=0)


class Club(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    admin = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='admin_clubs')
    # through model to store per-club role (sub-admin etc.)
    members = models.ManyToManyField('api.User', through='ClubMembership', related_name='clubs', blank=True)
    is_active = models.BooleanField(default=False, help_text="Set to True when a superuser approves the club")
    created_at = models.DateTimeField(auto_now_add=True)
    rejected_reason = models.TextField(blank=True, null=True, help_text="Reason for rejection if club was rejected")
    rejection_date = models.DateTimeField(null=True, blank=True)
    approved_date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name


class ClubMembership(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='memberships')
    is_subadmin = models.BooleanField(default=False)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('club', 'user')

    def __str__(self):
        return f"{self.user.username} @ {self.club.name} (subadmin={self.is_subadmin})"


class Post(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by {self.author.username} in {self.club.name}"


class Message(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='messages')
    author = models.ForeignKey('api.User', on_delete=models.CASCADE, related_name='messages')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message by {self.author.username} in {self.club.name}"


class Event(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.club.name})"
