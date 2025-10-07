from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, CompanyLeagueViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'company-leagues', CompanyLeagueViewSet, basename='company-league')

urlpatterns = [
    path('', include(router.urls)),
]
