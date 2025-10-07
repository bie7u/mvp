from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from companies.models import Company, CompanyLeague
from matches.models import League

User = get_user_model()


class Command(BaseCommand):
    help = 'Initialize the system with sample data for development'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Initializing system...'))

        # Create Root Admin if not exists
        if not User.objects.filter(role=User.Role.ROOT_ADMIN).exists():
            root_admin = User.objects.create_user(
                username='rootadmin',
                email='admin@footballpredictions.com',
                password='admin123',
                role=User.Role.ROOT_ADMIN,
                first_name='Root',
                last_name='Admin',
                is_staff=True,
                is_superuser=True,
            )
            self.stdout.write(self.style.SUCCESS(f'Created Root Admin: {root_admin.email}'))

        # Create sample leagues
        leagues_data = [
            {'name': 'Premier League', 'code': 'premier_league', 'country': 'England', 'api_id': 39, 'current_season': 2024},
            {'name': 'La Liga', 'code': 'la_liga', 'country': 'Spain', 'api_id': 140, 'current_season': 2024},
            {'name': 'Bundesliga', 'code': 'bundesliga', 'country': 'Germany', 'api_id': 78, 'current_season': 2024},
            {'name': 'Serie A', 'code': 'serie_a', 'country': 'Italy', 'api_id': 135, 'current_season': 2024},
            {'name': 'Ligue 1', 'code': 'ligue_1', 'country': 'France', 'api_id': 61, 'current_season': 2024},
            {'name': 'Ekstraklasa', 'code': 'ekstraklasa', 'country': 'Poland', 'api_id': 106, 'current_season': 2024},
        ]

        for league_data in leagues_data:
            league, created = League.objects.get_or_create(
                api_id=league_data['api_id'],
                defaults=league_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created league: {league.name}'))

        # Create sample company
        company, created = Company.objects.get_or_create(
            name='Demo Company',
            defaults={
                'description': 'A demo company for testing',
                'points_correct_score': 3,
                'points_correct_outcome': 1,
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created company: {company.name}'))

            # Associate all leagues with the demo company
            for league in League.objects.all():
                CompanyLeague.objects.get_or_create(
                    company=company,
                    league=league,
                    defaults={'is_active': True}
                )

        # Create Client Admin for demo company
        if not User.objects.filter(role=User.Role.CLIENT_ADMIN, company=company).exists():
            client_admin = User.objects.create_user(
                username='clientadmin',
                email='clientadmin@democompany.com',
                password='admin123',
                role=User.Role.CLIENT_ADMIN,
                company=company,
                first_name='Client',
                last_name='Admin',
            )
            self.stdout.write(self.style.SUCCESS(f'Created Client Admin: {client_admin.email}'))

        # Create sample employees
        for i in range(1, 4):
            email = f'employee{i}@democompany.com'
            if not User.objects.filter(email=email).exists():
                employee = User.objects.create_user(
                    username=f'employee{i}',
                    email=email,
                    password='employee123',
                    role=User.Role.EMPLOYEE,
                    company=company,
                    first_name=f'Employee',
                    last_name=f'{i}',
                    nickname=f'Player{i}',
                )
                self.stdout.write(self.style.SUCCESS(f'Created Employee: {employee.email}'))

        self.stdout.write(self.style.SUCCESS('\n=== System initialized successfully! ==='))
        self.stdout.write(self.style.SUCCESS('\nDefault credentials:'))
        self.stdout.write(self.style.SUCCESS('Root Admin: admin@footballpredictions.com / admin123'))
        self.stdout.write(self.style.SUCCESS('Client Admin: clientadmin@democompany.com / admin123'))
        self.stdout.write(self.style.SUCCESS('Employees: employee1@democompany.com / employee123 (and employee2, employee3)'))
