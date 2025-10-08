import pytest
from django.contrib.auth import get_user_model
from apps.companies.models import Company

User = get_user_model()

@pytest.mark.django_db
class TestUserModel:
    def test_create_user(self):
        """Test creating a regular user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123'
        )
        assert user.username == 'testuser'
        assert user.email == 'test@test.com'
        assert user.check_password('testpass123')
        assert user.role == 'employee'  # default role

    def test_create_root_admin(self):
        """Test creating a root admin user"""
        user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
            role='root_admin'
        )
        assert user.role == 'root_admin'

    def test_user_with_company(self):
        """Test user associated with company"""
        company = Company.objects.create(name='Test Co')
        user = User.objects.create_user(
            username='employee',
            email='emp@test.com',
            password='pass123',
            company=company
        )
        assert user.company == company
        assert user in company.employees.all()
