import pytest
from datetime import datetime, timedelta
from django.utils import timezone
from apps.leagues.models import League
from apps.matches.models import Match

@pytest.mark.django_db
class TestMatchModel:
    def test_create_match(self):
        """Test creating a match"""
        league = League.objects.create(
            name='premier_league',
            country='England',
            season='2023-2024',
            is_active=True
        )
        match = Match.objects.create(
            league=league,
            home_team='Team A',
            away_team='Team B',
            round='Round 1',
            kickoff_time=timezone.now() + timedelta(days=1),
            status='scheduled'
        )
        assert match.home_team == 'Team A'
        assert match.status == 'scheduled'

    def test_prediction_locked_before_kickoff(self):
        """Test that predictions are not locked before kickoff"""
        league = League.objects.create(
            name='premier_league',
            country='England',
            season='2023-2024'
        )
        match = Match.objects.create(
            league=league,
            home_team='Team A',
            away_team='Team B',
            round='Round 1',
            kickoff_time=timezone.now() + timedelta(hours=2)
        )
        assert match.is_prediction_locked is False

    def test_prediction_locked_after_kickoff(self):
        """Test that predictions are locked after kickoff"""
        league = League.objects.create(
            name='premier_league',
            country='England',
            season='2023-2024'
        )
        match = Match.objects.create(
            league=league,
            home_team='Team A',
            away_team='Team B',
            round='Round 1',
            kickoff_time=timezone.now() - timedelta(hours=1)
        )
        assert match.is_prediction_locked is True
