# api/management/commands/seed_data.py
import random
from faker import Faker
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import User, Club, ClubMembership, Post, Event, Message

class Command(BaseCommand):
    help = 'Seeds the database with realistic test data'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))
        
        # Clean slate
        self.stdout.write('Deleting old data...')
        User.objects.exclude(is_superuser=True).delete()
        Club.objects.all().delete()
        Post.objects.all().delete()
        Event.objects.all().delete()
        Message.objects.all().delete()

        fake = Faker()

        # Create Superuser
        superuser, created = User.objects.get_or_create(
            username='admin', 
            defaults={
                'email': 'admin@venti.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            superuser.set_password('adminpass')
            superuser.save()
            self.stdout.write(self.style.SUCCESS('Superuser "admin" created with password "adminpass"'))

        # Create Regular Users
        users = [superuser]
        for _ in range(10):
            username = fake.user_name()
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': fake.email()}
            )
            if created:
                user.set_password('password')
                user.save()
            users.append(user)
        self.stdout.write(f'{len(users)} users created.')

        # Create Clubs
        clubs = []
        club_names = ['Tech Innovators', 'Book Worms Society', 'Hiking Adventures', 'Future Entrepreneurs', 'Code & Coffee']
        for name in club_names:
            admin = random.choice(users)
            club = Club.objects.create(
                name=name,
                description=fake.paragraph(nb_sentences=3),
                admin=admin,
                is_active=random.choice([True, True, False]) # More likely to be active
            )
            # Creator is automatically a member
            ClubMembership.objects.create(club=club, user=admin)
            clubs.append(club)
        self.stdout.write(f'{len(clubs)} clubs created.')

        active_clubs = [c for c in clubs if c.is_active]

        # Create Memberships
        for club in active_clubs:
            # Add 2 to 5 random members to each active club
            members_to_add = random.sample(users, k=random.randint(2, 5))
            for user in members_to_add:
                ClubMembership.objects.get_or_create(club=club, user=user)
        self.stdout.write('Added random members to active clubs.')

        # Create Posts, Events, and Messages for active clubs
        for club in active_clubs:
            club_members = list(club.members.all())
            # Create Posts
            for _ in range(random.randint(2, 5)):
                Post.objects.create(
                    club=club,
                    author=random.choice(club_members),
                    content=fake.sentence(nb_words=15)
                )
            # Create Events
            for _ in range(random.randint(1, 3)):
                Event.objects.create(
                    club=club,
                    title=fake.catch_phrase(),
                    description=fake.text(),
                    date=timezone.now() + timedelta(days=random.randint(1, 30))
                )
            # Create Messages
            for _ in range(random.randint(5, 15)):
                Message.objects.create(
                    club=club,
                    author=random.choice(club_members),
                    text=fake.sentence(nb_words=8)
                )
        self.stdout.write('Created posts, events, and messages for active clubs.')

        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))