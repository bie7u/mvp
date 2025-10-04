from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from core.models import Client, Match, Bet, Badge

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate the database with sample data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')

        # Create Clients
        client1, _ = Client.objects.get_or_create(
            name='Premier League Club',
            defaults={
                'logo': 'https://example.com/logo1.png',
                'primary_color': '#0000FF',
                'secondary_color': '#FF0000',
            }
        )

        client2, _ = Client.objects.get_or_create(
            name='La Liga Club',
            defaults={
                'logo': 'https://example.com/logo2.png',
                'primary_color': '#FFD700',
                'secondary_color': '#8B0000',
            }
        )

        self.stdout.write(f'Created clients: {client1.name}, {client2.name}')

        # Create Users
        if not User.objects.filter(username='client1').exists():
            client_user1 = User.objects.create_user(
                username='client1',
                email='client1@example.com',
                password='client123',
                role='client_admin',
                client=client1
            )
            self.stdout.write(f'Created client admin user: {client_user1.username}')

        # Create regular users
        for i in range(1, 6):
            username = f'user{i}'
            if not User.objects.filter(username=username).exists():
                user = User.objects.create_user(
                    username=username,
                    email=f'{username}@example.com',
                    password='user123',
                    role='user',
                    client=client1 if i <= 3 else client2
                )
                self.stdout.write(f'Created user: {user.username}')

        # Create Matches
        now = timezone.now()
        matches_data = [
            {
                'home_team': 'Manchester United',
                'away_team': 'Liverpool',
                'match_date': now + timedelta(days=1),
                'league': 'Premier League',
                'status': 'scheduled',
            },
            {
                'home_team': 'Barcelona',
                'away_team': 'Real Madrid',
                'match_date': now + timedelta(days=2),
                'league': 'La Liga',
                'status': 'scheduled',
            },
            {
                'home_team': 'Chelsea',
                'away_team': 'Arsenal',
                'match_date': now + timedelta(days=3),
                'league': 'Premier League',
                'status': 'scheduled',
            },
            {
                'home_team': 'Bayern Munich',
                'away_team': 'Borussia Dortmund',
                'match_date': now - timedelta(days=1),
                'league': 'Bundesliga',
                'status': 'finished',
                'home_score': 3,
                'away_score': 1,
            },
            {
                'home_team': 'PSG',
                'away_team': 'Marseille',
                'match_date': now - timedelta(days=2),
                'league': 'Ligue 1',
                'status': 'finished',
                'home_score': 2,
                'away_score': 2,
            },
        ]

        for match_data in matches_data:
            match, created = Match.objects.get_or_create(
                home_team=match_data['home_team'],
                away_team=match_data['away_team'],
                defaults=match_data
            )
            if created:
                self.stdout.write(f'Created match: {match.home_team} vs {match.away_team}')

        # Create sample bets for finished matches
        finished_matches = Match.objects.filter(status='finished')
        users = User.objects.filter(role='user')

        for match in finished_matches:
            for user in users[:3]:  # Only first 3 users
                if not Bet.objects.filter(user=user, match=match).exists():
                    bet = Bet.objects.create(
                        user=user,
                        match=match,
                        predicted_home_score=match.home_score,
                        predicted_away_score=match.away_score,
                    )
                    bet.calculate_points()
                    self.stdout.write(f'Created bet for {user.username} on {match}')

        # Create Badges
        badges_data = [
            {
                'name': 'First Bet',
                'description': 'Place your first prediction',
                'badge_type': 'first_bet',
                'icon': '🎯',
                'requirement': 1,
            },
            {
                'name': 'Winning Streak',
                'description': 'Win 3 predictions in a row',
                'badge_type': 'winning_streak',
                'icon': '🔥',
                'requirement': 3,
            },
            {
                'name': 'Exact Score Master',
                'description': 'Predict 5 exact scores',
                'badge_type': 'exact_score',
                'icon': '🎖️',
                'requirement': 5,
            },
        ]

        for badge_data in badges_data:
            badge, created = Badge.objects.get_or_create(
                name=badge_data['name'],
                defaults=badge_data
            )
            if created:
                self.stdout.write(f'Created badge: {badge.name}')

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write('\nLogin credentials:')
        self.stdout.write('  Root Admin: username=admin, password=admin123')
        self.stdout.write('  Client Admin: username=client1, password=client123')
        self.stdout.write('  User: username=user1, password=user123 (also user2, user3, etc.)')
