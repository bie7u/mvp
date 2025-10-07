from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeagueViewSet, TeamViewSet, MatchViewSet

router = DefaultRouter()
router.register(r'leagues', LeagueViewSet, basename='league')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'matches', MatchViewSet, basename='match')

urlpatterns = [
    path('', include(router.urls)),
]
