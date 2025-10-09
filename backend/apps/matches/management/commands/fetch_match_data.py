import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from apps.matches.models import Match
from apps.leagues.models import League, Standing
from apps.predictions.models import Prediction
from apps.rankings.models import Ranking

class Command(BaseCommand):
    help = 'Fetch match data from API-Football and update results'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fetch-fixtures',
            action='store_true',
            help='Fetch all season fixtures',
        )
        parser.add_argument(
            '--update-results',
            action='store_true',
            help='Update finished match results',
        )
        parser.add_argument(
            '--fetch-standings',
            action='store_true',
            help='Fetch league standings',
        )
        parser.add_argument(
            '--league',
            type=str,
            help='Fetch fixtures for a specific league (by name or id)',
        )

    def handle(self, *args, **options):
        league_filter = options.get('league')
        
        if options['fetch_fixtures']:
            self.fetch_fixtures(league_filter)
        
        if options['update_results']:
            self.update_results()
        
        if options['fetch_standings']:
            self.fetch_standings(league_filter)
        
        # If no specific option, do all
        if not options['fetch_fixtures'] and not options['update_results'] and not options['fetch_standings']:
            self.fetch_fixtures(league_filter)
            self.update_results()
            self.fetch_standings(league_filter)

    def fetch_fixtures(self, league_filter=None):
        """Fetch ALL fixtures for the season from API-Football"""
        self.stdout.write('Fetching ALL season fixtures from API-Football...')
        
        if not settings.API_FOOTBALL_KEY:
            self.stdout.write(self.style.WARNING('API_FOOTBALL_KEY not set. Skipping fixture fetch.'))
            return

        headers = {
            'x-apisports-key': settings.API_FOOTBALL_KEY
        }

        # Get leagues to fetch
        leagues = League.objects.filter(is_active=True)
        if league_filter:
            # Try to filter by id or name
            if league_filter.isdigit():
                leagues = leagues.filter(id=int(league_filter))
            else:
                leagues = leagues.filter(name__icontains=league_filter)

        # Fetch ALL fixtures for each active league
        for league in leagues:
            if not league.api_football_id:
                self.stdout.write(
                    self.style.WARNING(f'Skipping {league.get_name_display()} - no API ID configured')
                )
                continue

            url = f"{settings.API_FOOTBALL_URL}/fixtures"
            params = {
                'league': league.api_football_id,
                'season': league.season.split('-')[0],  # e.g., "2023" from "2023-2024"
            }

            try:
                response = requests.get(url, headers=headers, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()

                if data.get('results', 0) > 0:
                    fixtures_count = 0
                    for fixture in data.get('response', []):
                        self.create_or_update_match(league, fixture)
                        fixtures_count += 1
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Fetched {fixtures_count} fixtures for {league.get_name_display()} ({league.season})'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'No fixtures found for {league.get_name_display()} ({league.season})'
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
    
    def fetch_standings(self, league_filter=None):
        """Fetch league standings from API-Football"""
        self.stdout.write('Fetching league standings from API-Football...')
        
        if not settings.API_FOOTBALL_KEY:
            self.stdout.write(self.style.WARNING('API_FOOTBALL_KEY not set. Skipping standings fetch.'))
            return

        headers = {
            'x-apisports-key': settings.API_FOOTBALL_KEY
        }

        # Get leagues to fetch
        leagues = League.objects.filter(is_active=True)
        if league_filter:
            # Try to filter by id or name
            if league_filter.isdigit():
                leagues = leagues.filter(id=int(league_filter))
            else:
                leagues = leagues.filter(name__icontains=league_filter)

        # Fetch standings for each active league
        for league in leagues:
            if not league.api_football_id:
                self.stdout.write(
                    self.style.WARNING(f'Skipping {league.get_name_display()} - no API ID configured')
                )
                continue

            url = f"{settings.API_FOOTBALL_URL}/standings"
            params = {
                'league': league.api_football_id,
                'season': league.season.split('-')[0],
            }

            try:
                response = requests.get(url, headers=headers, params=params, timeout=10)
                response.raise_for_status()
                data = response.json()

                if data.get('results', 0) > 0:
                    standings_data = data.get('response', [])[0]
                    league_standings = standings_data.get('league', {}).get('standings', [[]])[0]
                    
                    # Clear existing standings for this league
                    Standing.objects.filter(league=league).delete()
                    
                    # Create new standings
                    for team_data in league_standings:
                        Standing.objects.create(
                            league=league,
                            rank=team_data['rank'],
                            team_name=team_data['team']['name'],
                            team_logo=team_data['team']['logo'],
                            played=team_data['all']['played'],
                            won=team_data['all']['win'],
                            drawn=team_data['all']['draw'],
                            lost=team_data['all']['lose'],
                            goals_for=team_data['all']['goals']['for'],
                            goals_against=team_data['all']['goals']['against'],
                            goal_difference=team_data['goalsDiff'],
                            points=team_data['points'],
                            form=team_data.get('form', ''),
                        )
                    
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Updated standings for {league.get_name_display()} ({len(league_standings)} teams)'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'No standings found for {league.get_name_display()}'
                        )
                    )
            except requests.RequestException as e:
                self.stdout.write(
                    self.style.ERROR(f'Error fetching standings for {league.get_name_display()}: {str(e)}')
                )
