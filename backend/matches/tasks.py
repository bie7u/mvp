from django.conf import settings
from django.utils import timezone
import requests
import logging

from .models import League, Team, Match

logger = logging.getLogger(__name__)


def update_match_data():
    """Update match data from API-Football"""
    
    headers = {
        'x-rapidapi-key': settings.API_FOOTBALL_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
    }
    
    # Update matches for each active league
    leagues = League.objects.filter(is_active=True)
    
    for league in leagues:
        try:
            # Fetch fixtures for current season
            url = f"{settings.API_FOOTBALL_BASE_URL}/fixtures"
            params = {
                'league': league.api_id,
                'season': league.current_season,
            }
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('response'):
                    for fixture in data['response']:
                        update_match_from_api(fixture, league)
                        
            else:
                logger.error(f"Failed to fetch fixtures for league {league.name}: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Error updating matches for league {league.name}: {str(e)}")
    
    logger.info("Match data update completed")
    return "Match data updated successfully"


def update_match_from_api(fixture_data, league):
    """Update or create a match from API data"""
    
    try:
        fixture_id = fixture_data['fixture']['id']
        
        # Get or create teams
        home_team_data = fixture_data['teams']['home']
        away_team_data = fixture_data['teams']['away']
        
        home_team, _ = Team.objects.get_or_create(
            api_id=home_team_data['id'],
            defaults={
                'name': home_team_data['name'],
                'code': home_team_data.get('code', ''),
                'country': league.country
            }
        )
        
        away_team, _ = Team.objects.get_or_create(
            api_id=away_team_data['id'],
            defaults={
                'name': away_team_data['name'],
                'code': away_team_data.get('code', ''),
                'country': league.country
            }
        )
        
        # Determine match status
        status_map = {
            'NS': Match.Status.SCHEDULED,
            'LIVE': Match.Status.IN_PLAY,
            '1H': Match.Status.IN_PLAY,
            'HT': Match.Status.IN_PLAY,
            '2H': Match.Status.IN_PLAY,
            'ET': Match.Status.IN_PLAY,
            'P': Match.Status.IN_PLAY,
            'FT': Match.Status.FINISHED,
            'AET': Match.Status.FINISHED,
            'PEN': Match.Status.FINISHED,
            'PST': Match.Status.POSTPONED,
            'CANC': Match.Status.CANCELLED,
            'ABD': Match.Status.CANCELLED,
        }
        
        api_status = fixture_data['fixture']['status']['short']
        match_status = status_map.get(api_status, Match.Status.SCHEDULED)
        
        # Get scores
        goals = fixture_data.get('goals', {})
        home_score = goals.get('home')
        away_score = goals.get('away')
        
        # Update or create match
        match, created = Match.objects.update_or_create(
            api_id=fixture_id,
            defaults={
                'league': league,
                'home_team': home_team,
                'away_team': away_team,
                'start_time': timezone.datetime.fromisoformat(
                    fixture_data['fixture']['date'].replace('Z', '+00:00')
                ),
                'round': fixture_data['league']['round'],
                'status': match_status,
                'home_score': home_score,
                'away_score': away_score,
                'season': fixture_data['league']['season'],
            }
        )
        
        # If match is finished, calculate prediction points
        if match_status == Match.Status.FINISHED and match.home_score is not None:
            from predictions.tasks import calculate_prediction_points
            calculate_prediction_points(match.id)
        
        action = "Created" if created else "Updated"
        logger.info(f"{action} match: {match}")
        
    except Exception as e:
        logger.error(f"Error updating match from API: {str(e)}")


def fetch_leagues():
    """Fetch and update league data from API-Football"""
    
    headers = {
        'x-rapidapi-key': settings.API_FOOTBALL_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
    }
    
    # Mapping of league codes to API IDs (example values, update with actual IDs)
    league_mappings = {
        'premier_league': {'api_id': 39, 'country': 'England'},
        'la_liga': {'api_id': 140, 'country': 'Spain'},
        'bundesliga': {'api_id': 78, 'country': 'Germany'},
        'serie_a': {'api_id': 135, 'country': 'Italy'},
        'ligue_1': {'api_id': 61, 'country': 'France'},
        'ekstraklasa': {'api_id': 106, 'country': 'Poland'},
    }
    
    for code, data in league_mappings.items():
        try:
            url = f"{settings.API_FOOTBALL_BASE_URL}/leagues"
            params = {'id': data['api_id']}
            
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                api_data = response.json()
                
                if api_data.get('response'):
                    league_data = api_data['response'][0]['league']
                    season_data = api_data['response'][0]['seasons'][0]
                    
                    League.objects.update_or_create(
                        api_id=data['api_id'],
                        defaults={
                            'name': league_data['name'],
                            'code': code,
                            'country': data['country'],
                            'current_season': season_data['year'],
                            'is_active': True,
                        }
                    )
                    
                    logger.info(f"Updated league: {league_data['name']}")
                    
        except Exception as e:
            logger.error(f"Error fetching league {code}: {str(e)}")
    
    return "Leagues updated successfully"
