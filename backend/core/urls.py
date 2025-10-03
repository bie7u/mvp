from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ClientViewSet, MatchViewSet, BetViewSet,
    LeaderboardViewSet, BadgeViewSet, UserBadgeViewSet, StatisticsViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'bets', BetViewSet, basename='bet')
router.register(r'leaderboard', LeaderboardViewSet, basename='leaderboard')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'user-badges', UserBadgeViewSet, basename='user-badge')
router.register(r'statistics', StatisticsViewSet, basename='statistics')

urlpatterns = [
    path('', include(router.urls)),
]
