import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from apps.matches.models import Match
from apps.leagues.models import League
from apps.predictions.models import Prediction
from apps.rankings.models import Ranking

class Command(BaseCommand):
    help = 'Fetch match data from API-Football and update results'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fetch-fixtures',
            action='store_true',
            help='Fetch upcoming fixtures',
        )
        parser.add_argument(
            '--update-results',
            action='store_true',
            help='Update finished match results',
        )

    def handle(self, *args, **options):
        if options['fetch_fixtures']:
            self.fetch_fixtures()
        
        if options['update_results']:
            self.update_results()
        
        # If no specific option, do both
        if not options['fetch_fixtures'] and not options['update_results']:
            self.fetch_fixtures()
            self.update_results()

    def fetch_fixtures(self):
        """Fetch upcoming fixtures from API-Football"""
        self.stdout.write('Fetching fixtures from API-Football...')
        
        if not settings.API_FOOTBALL_KEY:
            self.stdout.write(self.style.WARNING('API_FOOTBALL_KEY not set. Skipping fixture fetch.'))
            return

        headers = {
            'x-apisports-key': settings.API_FOOTBALL_KEY
        }

        # Fetch fixtures for each active league
        for league in League.objects.filter(is_active=True):
            if not league.api_football_id:
                continue

            url = f"{settings.API_FOOTBALL_URL}/fixtures"
            params = {
                'league': league.api_football_id,
                'season': league.season.split('-')[0],  # e.g., "2023" from "2023-2024"
                'next': 50  # Fetch next 50 matches
            }

            try:
                response = requests.get(url, headers=headers, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()

                if data.get('results', 0) > 0:
                    for fixture in data.get('response', []):
                        self.create_or_update_match(league, fixture)
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Fetched {data.get("results")} fixtures for {league.get_name_display()}'
                        )
                    )
            except requests.RequestException as e:
                self.stdout.write(
                    self.style.ERROR(f'Error fetching fixtures for {league.get_name_display()}: {str(e)}')
                )

    def update_results(self):
        """Update results for finished matches"""
        self.stdout.write('Updating match results...')
        
        if not settings.API_FOOTBALL_KEY:
            self.stdout.write(self.style.WARNING('API_FOOTBALL_KEY not set. Skipping result updates.'))
            return

        headers = {
            'x-apisports-key': settings.API_FOOTBALL_KEY
        }

        # Get matches that might have finished (status is not finished and kickoff was in the past)
        matches_to_update = Match.objects.filter(
            kickoff_time__lte=timezone.now(),
            status__in=['scheduled', 'live']
        )

        for match in matches_to_update:
            if not match.api_football_id:
                continue

            url = f"{settings.API_FOOTBALL_URL}/fixtures"
            params = {
                'id': match.api_football_id
            }

            try:
                response = requests.get(url, headers=headers, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()

                if data.get('results', 0) > 0:
                    fixture = data['response'][0]
                    self.update_match_result(match, fixture)
                    
            except requests.RequestException as e:
                self.stdout.write(
                    self.style.ERROR(f'Error updating match {match.id}: {str(e)}')
                )

        # Update predictions and rankings after results are updated
        self.update_predictions_and_rankings()

    def create_or_update_match(self, league, fixture_data):
        """Create or update match from API data"""
        api_id = fixture_data['fixture']['id']
        
        match_data = {
            'league': league,
            'api_football_id': api_id,
            'home_team': fixture_data['teams']['home']['name'],
            'away_team': fixture_data['teams']['away']['name'],
            'round': fixture_data['league']['round'],
            'kickoff_time': timezone.datetime.fromisoformat(
                fixture_data['fixture']['date'].replace('Z', '+00:00')
            ),
            'status': self.map_status(fixture_data['fixture']['status']['short']),
        }

        # Add scores if available
        if fixture_data['goals']['home'] is not None:
            match_data['home_score'] = fixture_data['goals']['home']
        if fixture_data['goals']['away'] is not None:
            match_data['away_score'] = fixture_data['goals']['away']

        Match.objects.update_or_create(
            api_football_id=api_id,
            defaults=match_data
        )

    def update_match_result(self, match, fixture_data):
        """Update match with latest result"""
        status = self.map_status(fixture_data['fixture']['status']['short'])
        
        match.status = status
        if fixture_data['goals']['home'] is not None:
            match.home_score = fixture_data['goals']['home']
        if fixture_data['goals']['away'] is not None:
            match.away_score = fixture_data['goals']['away']
        
        match.save()

        if status == 'finished':
            self.stdout.write(
                self.style.SUCCESS(
                    f'Updated result: {match.home_team} {match.home_score}-{match.away_score} {match.away_team}'
                )
            )

    def map_status(self, api_status):
        """Map API-Football status to our status choices"""
        status_map = {
            'TBD': 'scheduled',
            'NS': 'scheduled',
            '1H': 'live',
            'HT': 'live',
            '2H': 'live',
            'ET': 'live',
            'P': 'live',
            'FT': 'finished',
            'AET': 'finished',
            'PEN': 'finished',
            'PST': 'postponed',
            'CANC': 'cancelled',
            'ABD': 'cancelled',
            'AWD': 'finished',
            'WO': 'finished',
        }
        return status_map.get(api_status, 'scheduled')

    def update_predictions_and_rankings(self):
        """Update predictions points and rankings after match results"""
        # Update points for all predictions of finished matches
        finished_matches = Match.objects.filter(status='finished')
        
        for match in finished_matches:
            predictions = Prediction.objects.filter(match=match)
            for prediction in predictions:
                prediction.save()  # This will recalculate points
        
        # Update rankings for each company
        from apps.companies.models import Company
        from datetime import datetime
        
        for company in Company.objects.filter(is_active=True):
            current_year = datetime.now().year
            season = f"{current_year}-{current_year + 1}"
            Ranking.update_rankings(company, 'season', season)
        
        self.stdout.write(self.style.SUCCESS('Updated predictions and rankings'))
