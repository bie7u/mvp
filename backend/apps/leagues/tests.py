import pytest
from apps.leagues.models import League, Standing

@pytest.mark.django_db
class TestLeagueModel:
    def test_create_league(self):
        """Test creating a league"""
        league = League.objects.create(
            name='premier_league',
            api_football_id=39,
            country='England',
            season='2023-2024',
            is_active=True
        )
        assert league.name == 'premier_league'
        assert league.api_football_id == 39
        assert league.country == 'England'
        assert league.season == '2023-2024'
        assert str(league) == 'Premier League (2023-2024)'


@pytest.mark.django_db
class TestStandingModel:
    def test_create_standing(self):
        """Test creating a standing entry"""
        league = League.objects.create(
            name='premier_league',
            api_football_id=39,
            country='England',
            season='2023-2024',
            is_active=True
        )
        
        standing = Standing.objects.create(
            league=league,
            rank=1,
            team_name='Manchester City',
            played=10,
            won=8,
            drawn=1,
            lost=1,
            goals_for=25,
            goals_against=10,
            goal_difference=15,
            points=25,
            form='WWDWW'
        )
        
        assert standing.rank == 1
        assert standing.team_name == 'Manchester City'
        assert standing.points == 25
        assert standing.league == league
        assert str(standing) == '1. Manchester City (Premier League)'
    
    def test_standing_ordering(self):
        """Test that standings are ordered by league and rank"""
        league = League.objects.create(
            name='premier_league',
            api_football_id=39,
            country='England',
            season='2023-2024'
        )
        
        Standing.objects.create(league=league, rank=2, team_name='Arsenal', points=22)
        Standing.objects.create(league=league, rank=1, team_name='Man City', points=25)
        Standing.objects.create(league=league, rank=3, team_name='Liverpool', points=20)
        
        standings = Standing.objects.all()
        assert standings[0].rank == 1
        assert standings[1].rank == 2
        assert standings[2].rank == 3
