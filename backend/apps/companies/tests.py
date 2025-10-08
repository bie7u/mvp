import pytest
from apps.companies.models import Company, ScoringConfig

@pytest.mark.django_db
class TestCompanyModel:
    def test_create_company(self):
        """Test creating a company"""
        company = Company.objects.create(
            name='Test Company',
            description='Test Description',
            is_active=True
        )
        assert company.name == 'Test Company'
        assert company.is_active is True

    def test_scoring_config_default(self):
        """Test default scoring configuration"""
        company = Company.objects.create(name='Test Co')
        config = ScoringConfig.objects.create(company=company)
        assert config.correct_score_points == 3
        assert config.correct_outcome_points == 1

    def test_custom_scoring_config(self):
        """Test custom scoring configuration"""
        company = Company.objects.create(name='Test Co')
        config = ScoringConfig.objects.create(
            company=company,
            correct_score_points=5,
            correct_outcome_points=2
        )
        assert config.correct_score_points == 5
        assert config.correct_outcome_points == 2
