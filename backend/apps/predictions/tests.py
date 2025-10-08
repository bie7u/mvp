import pytest
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from apps.leagues.models import League
from apps.matches.models import Match
from apps.predictions.models import Prediction
from apps.companies.models import Company, ScoringConfig

User = get_user_model()

@pytest.mark.django_db
class TestPredictionModel:
    def test_create_prediction(self):
        """Test creating a prediction"""
        company = Company.objects.create(name='Test Co')
        user = User.objects.create_user(
            username='user1',
            password='pass123',
            company=company
        )
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
            kickoff_time=timezone.now() + timedelta(days=1)
        )
        prediction = Prediction.objects.create(
            user=user,
            match=match,
            home_score=2,
            away_score=1
        )
        assert prediction.home_score == 2
        assert prediction.away_score == 1
        assert prediction.points_earned == 0  # Match not finished

    def test_calculate_points_correct_score(self):
        """Test points calculation for correct score"""
        company = Company.objects.create(name='Test Co')
        ScoringConfig.objects.create(
            company=company,
            correct_score_points=3,
            correct_outcome_points=1
        )
        user = User.objects.create_user(
            username='user1',
            password='pass123',
            company=company
        )
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
            kickoff_time=timezone.now(),
            status='finished',
            home_score=2,
            away_score=1
        )
        prediction = Prediction.objects.create(
            user=user,
            match=match,
            home_score=2,
            away_score=1
        )
        assert prediction.calculate_points() == 3

    def test_calculate_points_correct_outcome(self):
        """Test points calculation for correct outcome only"""
        company = Company.objects.create(name='Test Co')
        ScoringConfig.objects.create(
            company=company,
            correct_score_points=3,
            correct_outcome_points=1
        )
        user = User.objects.create_user(
            username='user1',
            password='pass123',
            company=company
        )
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
            kickoff_time=timezone.now(),
            status='finished',
            home_score=3,
            away_score=1
        )
        prediction = Prediction.objects.create(
            user=user,
            match=match,
            home_score=2,
            away_score=1
        )
        assert prediction.calculate_points() == 1
