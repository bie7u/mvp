from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import League
from .serializers import LeagueSerializer
from apps.users.permissions import IsRootAdmin

class LeagueViewSet(viewsets.ModelViewSet):
    """ViewSet for managing leagues"""
    queryset = League.objects.all()
    serializer_class = LeagueSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsRootAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = League.objects.all()
        
        # Filter by user's company leagues if not root admin
        user = self.request.user
        if user.role != 'root_admin' and user.company:
            company_league_ids = user.company.company_leagues.values_list('league_id', flat=True)
            queryset = queryset.filter(id__in=company_league_ids)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset
