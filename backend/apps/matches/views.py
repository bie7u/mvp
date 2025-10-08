from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Match
from .serializers import MatchSerializer, MatchCreateSerializer
from apps.users.permissions import IsRootAdmin

class MatchViewSet(viewsets.ModelViewSet):
    """ViewSet for managing matches"""
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['league', 'status', 'round']
    search_fields = ['home_team', 'away_team']
    ordering_fields = ['kickoff_time', 'created_at']
    ordering = ['-kickoff_time']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsRootAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MatchCreateSerializer
        return MatchSerializer
    
    def get_queryset(self):
        queryset = Match.objects.all()
        
        # Filter by user's company leagues if not root admin
        user = self.request.user
        if user.role != 'root_admin' and user.company:
            company_league_ids = user.company.company_leagues.values_list('league_id', flat=True)
            queryset = queryset.filter(league_id__in=company_league_ids)
        
        # Additional filters from query params
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(kickoff_time__gte=date_from)
        if date_to:
            queryset = queryset.filter(kickoff_time__lte=date_to)
        
        return queryset
