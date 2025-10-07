from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PredictionViewSet, RankingViewSet

router = DefaultRouter()
router.register(r'predictions', PredictionViewSet, basename='prediction')
router.register(r'rankings', RankingViewSet, basename='ranking')

urlpatterns = [
    path('', include(router.urls)),
]
