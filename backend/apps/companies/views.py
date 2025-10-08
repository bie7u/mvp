from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Company, CompanyLeague, ScoringConfig
from .serializers import (
    CompanySerializer, CompanyCreateSerializer, 
    CompanyLeagueSerializer, ScoringConfigSerializer
)
from apps.users.permissions import IsRootAdmin
from apps.leagues.models import League

class CompanyViewSet(viewsets.ModelViewSet):
    """ViewSet for managing companies"""
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated, IsRootAdmin]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CompanyCreateSerializer
        return CompanySerializer
    
    @action(detail=True, methods=['post'])
    def assign_league(self, request, pk=None):
        """Assign a league to company"""
        company = self.get_object()
        league_id = request.data.get('league_id')
        
        if not league_id:
            return Response({"error": "league_id is required"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            league = League.objects.get(id=league_id)
            CompanyLeague.objects.get_or_create(company=company, league=league)
            return Response({"detail": "League assigned successfully."})
        except League.DoesNotExist:
            return Response({"error": "League not found"}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['delete'])
    def remove_league(self, request, pk=None):
        """Remove a league from company"""
        company = self.get_object()
        league_id = request.data.get('league_id')
        
        if not league_id:
            return Response({"error": "league_id is required"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            company_league = CompanyLeague.objects.get(company=company, league_id=league_id)
            company_league.delete()
            return Response({"detail": "League removed successfully."})
        except CompanyLeague.DoesNotExist:
            return Response({"error": "League assignment not found"}, 
                          status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get', 'put', 'patch'])
    def scoring_config(self, request, pk=None):
        """Get or update scoring configuration for company"""
        company = self.get_object()
        config, created = ScoringConfig.objects.get_or_create(
            company=company,
            defaults={'correct_score_points': 3, 'correct_outcome_points': 1}
        )
        
        if request.method == 'GET':
            serializer = ScoringConfigSerializer(config)
            return Response(serializer.data)
        
        serializer = ScoringConfigSerializer(config, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
