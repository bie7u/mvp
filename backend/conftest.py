import pytest
from django.contrib.auth import get_user_model
from apps.companies.models import Company

User = get_user_model()

@pytest.fixture
def root_admin_user(db):
    """Create a root admin user for testing"""
    return User.objects.create_user(
        username='root_admin',
        email='root@test.com',
        password='testpass123',
        role='root_admin'
    )

@pytest.fixture
def company(db):
    """Create a test company"""
    return Company.objects.create(
        name='Test Company',
        description='Test Description',
        is_active=True
    )

@pytest.fixture
def client_admin_user(db, company):
    """Create a client admin user for testing"""
    return User.objects.create_user(
        username='client_admin',
        email='client@test.com',
        password='testpass123',
        role='client_admin',
        company=company
    )

@pytest.fixture
def employee_user(db, company):
    """Create an employee user for testing"""
    return User.objects.create_user(
        username='employee',
        email='employee@test.com',
        password='testpass123',
        role='employee',
        company=company
    )
