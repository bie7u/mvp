from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Prediction
from .serializers import PredictionSerializer, PredictionCreateSerializer

class PredictionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing predictions"""
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['match', 'user']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PredictionCreateSerializer
        return PredictionSerializer
    
    def get_queryset(self):
        user = self.request.user
        queryset = Prediction.objects.all()
        
        # Users can only see their own predictions and predictions for finished matches
        if user.role == 'employee':
            # Own predictions
            own_predictions = Prediction.objects.filter(user=user)
            # Other users' predictions for finished matches only
            finished_predictions = Prediction.objects.filter(
                match__status='finished',
                user__company=user.company
            ).exclude(user=user)
            queryset = own_predictions | finished_predictions
        elif user.role == 'client_admin':
            # Can see all predictions in their company
            queryset = Prediction.objects.filter(user__company=user.company)
        # Root admin can see all
        
        return queryset.distinct()
    
    def perform_create(self, serializer):
        # Set the user to the current user
        serializer.save(user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if user owns this prediction
        if instance.user != request.user:
            return Response(
                {"detail": "You can only update your own predictions."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if match has started
        if instance.match.is_prediction_locked:
            return Response(
                {"detail": "Cannot update prediction after match has started."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if user owns this prediction
        if instance.user != request.user:
            return Response(
                {"detail": "You can only delete your own predictions."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if match has started
        if instance.match.is_prediction_locked:
            return Response(
                {"detail": "Cannot delete prediction after match has started."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)
