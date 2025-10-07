from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Company, CompanyLeague
from .serializers import (
    CompanySerializer, CompanyLeagueSerializer, CompanyScoringSerializer
)
from accounts.permissions import IsRootAdmin, IsClientAdminOrRootAdmin


class CompanyViewSet(viewsets.ModelViewSet):
    """ViewSet for Company model"""
    
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_active']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRootAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_root_admin():
            return Company.objects.all()
        elif user.is_client_admin() or user.is_employee():
            return Company.objects.filter(id=user.company_id)
        
        return Company.objects.none()
    
    @action(detail=True, methods=['put', 'patch'], permission_classes=[IsRootAdmin])
    def scoring(self, request, pk=None):
        """Update company scoring configuration"""
        company = self.get_object()
        serializer = CompanyScoringSerializer(
            company,
            data=request.data,
            partial=request.method == 'PATCH'
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get company statistics"""
        company = self.get_object()
        
        # Check permission
        if not request.user.is_root_admin() and company != request.user.company:
            return Response(
                {"error": "You don't have permission to view this company's statistics"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from predictions.models import Prediction, Ranking
        from django.db.models import Sum, Count, Avg
        
        employees = company.employees.filter(is_active=True)
        
        total_predictions = Prediction.objects.filter(
            user__company=company
        ).count()
        
        total_points = Prediction.objects.filter(
            user__company=company
        ).aggregate(total=Sum('points_earned'))['total'] or 0
        
        active_users = employees.count()
        
        avg_predictions_per_user = total_predictions / active_users if active_users > 0 else 0
        
        return Response({
            'company_id': company.id,
            'company_name': company.name,
            'total_employees': active_users,
            'total_predictions': total_predictions,
            'total_points': total_points,
            'avg_predictions_per_user': round(avg_predictions_per_user, 2),
        })


class CompanyLeagueViewSet(viewsets.ModelViewSet):
    """ViewSet for CompanyLeague model"""
    
    queryset = CompanyLeague.objects.all()
    serializer_class = CompanyLeagueSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company', 'league', 'is_active']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRootAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_root_admin():
            return CompanyLeague.objects.all()
        elif user.is_client_admin() or user.is_employee():
            return CompanyLeague.objects.filter(company=user.company)
        
        return CompanyLeague.objects.none()

