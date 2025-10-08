from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.companies.models import Company, ScoringConfig
from apps.leagues.models import League
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with initial data for development'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create root admin
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                role='root_admin'
            )
            self.stdout.write(self.style.SUCCESS('Created root admin user (username: admin, password: admin123)'))

        # Create leagues
        leagues_data = [
            {'name': 'premier_league', 'api_football_id': 39, 'country': 'England', 'season': '2023-2024'},
            {'name': 'la_liga', 'api_football_id': 140, 'country': 'Spain', 'season': '2023-2024'},
            {'name': 'bundesliga', 'api_football_id': 78, 'country': 'Germany', 'season': '2023-2024'},
            {'name': 'serie_a', 'api_football_id': 135, 'country': 'Italy', 'season': '2023-2024'},
            {'name': 'ligue_1', 'api_football_id': 61, 'country': 'France', 'season': '2023-2024'},
            {'name': 'ekstraklasa', 'api_football_id': 106, 'country': 'Poland', 'season': '2023-2024'},
        ]

        for league_data in leagues_data:
            league, created = League.objects.get_or_create(
                name=league_data['name'],
                season=league_data['season'],
                defaults={
                    'api_football_id': league_data['api_football_id'],
                    'country': league_data['country'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created league: {league.get_name_display()}'))

        # Create test company
        company, created = Company.objects.get_or_create(
            name='Test Company',
            defaults={'description': 'Test company for development', 'is_active': True}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created Test Company'))

        # Create scoring config for company
        config, created = ScoringConfig.objects.get_or_create(
            company=company,
            defaults={'correct_score_points': 3, 'correct_outcome_points': 1}
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created scoring config for Test Company'))

        # Assign leagues to company
        premier_league = League.objects.get(name='premier_league', season='2023-2024')
        from apps.companies.models import CompanyLeague
        CompanyLeague.objects.get_or_create(company=company, league=premier_league)
        
        # Create client admin
        if not User.objects.filter(username='client_admin').exists():
            User.objects.create_user(
                username='client_admin',
                email='client@example.com',
                password='client123',
                role='client_admin',
                company=company
            )
            self.stdout.write(self.style.SUCCESS('Created client admin user (username: client_admin, password: client123)'))

        # Create test employees
        for i in range(1, 4):
            username = f'employee{i}'
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(
                    username=username,
                    email=f'employee{i}@example.com',
                    password='employee123',
                    role='employee',
                    company=company,
                    nickname=f'Player {i}'
                )
                self.stdout.write(self.style.SUCCESS(f'Created employee user: {username} (password: employee123)'))

        self.stdout.write(self.style.SUCCESS('Database seeding completed!'))
        self.stdout.write(self.style.WARNING('\nTest credentials:'))
        self.stdout.write('Root Admin: admin / admin123')
        self.stdout.write('Client Admin: client_admin / client123')
        self.stdout.write('Employees: employee1, employee2, employee3 / employee123')
