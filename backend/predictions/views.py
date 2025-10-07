from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Prediction, Ranking
from matches.models import Match
from .serializers import (
    PredictionSerializer, PredictionCreateUpdateSerializer,
    RankingSerializer, UserStatsSerializer
)


class PredictionViewSet(viewsets.ModelViewSet):
    """ViewSet for Prediction model"""
    
    queryset = Prediction.objects.all()
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['match', 'user']
    ordering_fields = ['created_at', 'points_earned']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PredictionCreateUpdateSerializer
        return PredictionSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Prediction.objects.all()
        
        # Users can see their own predictions
        # After match ends, users can see all predictions from their company
        if not user.is_root_admin():
            queryset = queryset.filter(
                Q(user=user) |
                Q(
                    user__company=user.company,
                    match__status=Match.Status.FINISHED
                )
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_predictions(self, request):
        """Get current user's predictions"""
        predictions = Prediction.objects.filter(
            user=request.user
        ).order_by('-created_at')
        
        serializer = PredictionSerializer(predictions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple predictions at once"""
        predictions_data = request.data.get('predictions', [])
        
        if not predictions_data:
            return Response(
                {"error": "No predictions provided"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_predictions = []
        errors = []
        
        for pred_data in predictions_data:
            serializer = PredictionCreateUpdateSerializer(
                data=pred_data,
                context={'request': request}
            )
            
            if serializer.is_valid():
                serializer.save(user=request.user)
                created_predictions.append(serializer.data)
            else:
                errors.append({
                    'match': pred_data.get('match'),
                    'errors': serializer.errors
                })
        
        return Response({
            'created': len(created_predictions),
            'predictions': created_predictions,
            'errors': errors
        }, status=status.HTTP_201_CREATED if created_predictions else status.HTTP_400_BAD_REQUEST)


class RankingViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Ranking model (read-only)"""
    
    queryset = Ranking.objects.all()
    serializer_class = RankingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['company', 'period']
    ordering_fields = ['rank', 'total_points', 'total_predictions']
    ordering = ['rank']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Ranking.objects.all()
        
        # Filter by company
        if not user.is_root_admin():
            queryset = queryset.filter(company=user.company)
        
        # Filter by period from query params
        period = self.request.query_params.get('period')
        if period:
            queryset = queryset.filter(period=period)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def current_season(self, request):
        """Get current season rankings"""
        user = request.user
        
        rankings = Ranking.objects.filter(
            company=user.company,
            period=Ranking.Period.SEASON
        ).order_by('rank')
        
        serializer = RankingSerializer(rankings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """Get current month rankings"""
        user = request.user
        
        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        rankings = Ranking.objects.filter(
            company=user.company,
            period=Ranking.Period.MONTH,
            period_start=month_start.date()
        ).order_by('rank')
        
        serializer = RankingSerializer(rankings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def current_week(self, request):
        """Get current week rankings"""
        user = request.user
        
        now = timezone.now()
        week_start = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        
        rankings = Ranking.objects.filter(
            company=user.company,
            period=Ranking.Period.WEEK,
            period_start=week_start.date()
        ).order_by('rank')
        
        serializer = RankingSerializer(rankings, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_stats(self, request):
        """Get current user's statistics"""
        user = request.user
        
        total_predictions = Prediction.objects.filter(user=user).count()
        total_points = Prediction.objects.filter(
            user=user
        ).aggregate(total=Sum('points_earned'))['total'] or 0
        
        # Calculate correct scores and outcomes
        from matches.models import Match
        finished_predictions = Prediction.objects.filter(
            user=user,
            match__status=Match.Status.FINISHED
        )
        
        correct_scores = 0
        correct_outcomes = 0
        
        for pred in finished_predictions:
            if (pred.home_score == pred.match.home_score and 
                pred.away_score == pred.match.away_score):
                correct_scores += 1
            else:
                # Check for correct outcome
                pred_diff = pred.home_score - pred.away_score
                actual_diff = pred.match.home_score - pred.match.away_score
                if ((pred_diff > 0 and actual_diff > 0) or
                    (pred_diff < 0 and actual_diff < 0) or
                    (pred_diff == 0 and actual_diff == 0)):
                    correct_outcomes += 1
        
        accuracy = (correct_scores / total_predictions * 100) if total_predictions > 0 else 0
        
        # Get current rank
        current_ranking = Ranking.objects.filter(
            user=user,
            company=user.company,
            period=Ranking.Period.SEASON
        ).first()
        
        rank = current_ranking.rank if current_ranking else 0
        
        stats = {
            'total_predictions': total_predictions,
            'total_points': total_points,
            'correct_scores': correct_scores,
            'correct_outcomes': correct_outcomes,
            'accuracy_percentage': round(accuracy, 2),
            'rank': rank
        }
        
        serializer = UserStatsSerializer(stats)
        return Response(serializer.data)

