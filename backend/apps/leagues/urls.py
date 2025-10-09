from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeagueViewSet, StandingViewSet

router = DefaultRouter()
router.register(r'', LeagueViewSet, basename='league')

urlpatterns = [
    path('', include(router.urls)),
    path('standings/', StandingViewSet.as_view({'get': 'list'}), name='standing-list'),
    path('standings/<int:pk>/', StandingViewSet.as_view({'get': 'retrieve'}), name='standing-detail'),
]
