from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Ranking
from .serializers import RankingSerializer

class RankingViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing rankings"""
    serializer_class = RankingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['company', 'period', 'period_identifier']
    
    def get_queryset(self):
        user = self.request.user
        queryset = Ranking.objects.all()
        
        # Filter by user's company if not root admin
        if user.role != 'root_admin':
            if user.company:
                queryset = queryset.filter(company=user.company)
            else:
                queryset = queryset.none()
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def update_rankings(self, request):
        """Trigger ranking update for a company and period"""
        company_id = request.data.get('company_id')
        period = request.data.get('period', 'season')
        period_identifier = request.data.get('period_identifier')
        
        if not all([company_id, period_identifier]):
            return Response(
                {"error": "company_id and period_identifier are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from apps.companies.models import Company
            company = Company.objects.get(id=company_id)
            
            # Update rankings
            Ranking.update_rankings(company, period, period_identifier)
            
            return Response({"detail": "Rankings updated successfully."})
        except Company.DoesNotExist:
            return Response(
                {"error": "Company not found"},
                status=status.HTTP_404_NOT_FOUND
            )
