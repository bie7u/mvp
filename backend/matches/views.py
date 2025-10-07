from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.pagination import PageNumberPagination

from .models import League, Team, Match
from .serializers import LeagueSerializer, TeamSerializer, MatchSerializer, MatchListSerializer
from accounts.permissions import IsRootAdmin


class MatchPagination(PageNumberPagination):
    """Pagination for matches"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class LeagueViewSet(viewsets.ModelViewSet):
    """ViewSet for League model"""
    
    queryset = League.objects.all()
    serializer_class = LeagueSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['code', 'is_active']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRootAdmin()]
        return [IsAuthenticated()]


class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Team model (read-only)"""
    
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['country']
    permission_classes = [IsAuthenticated]


class MatchViewSet(viewsets.ModelViewSet):
    """ViewSet for Match model"""
    
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    pagination_class = MatchPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['league', 'status', 'season', 'round']
    ordering_fields = ['start_time', 'created_at']
    ordering = ['start_time']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRootAdmin()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MatchListSerializer
        return MatchSerializer
    
    def get_queryset(self):
        queryset = Match.objects.all()
        user = self.request.user
        
        # Filter by company leagues if not root admin
        if not user.is_root_admin():
            if user.company:
                company_league_ids = user.company.company_leagues.filter(
                    is_active=True
                ).values_list('league_id', flat=True)
                queryset = queryset.filter(league_id__in=company_league_ids)
            else:
                queryset = Match.objects.none()
        
        # Additional filters from query params
        league_code = self.request.query_params.get('league_code')
        if league_code:
            queryset = queryset.filter(league__code=league_code)
        
        upcoming = self.request.query_params.get('upcoming')
        if upcoming == 'true':
            from django.utils import timezone
            queryset = queryset.filter(
                start_time__gte=timezone.now(),
                status=Match.Status.SCHEDULED
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming matches"""
        from django.utils import timezone
        
        matches = self.get_queryset().filter(
            start_time__gte=timezone.now(),
            status=Match.Status.SCHEDULED
        ).order_by('start_time')[:20]
        
        serializer = MatchListSerializer(matches, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_league(self, request):
        """Get matches grouped by league"""
        from django.utils import timezone
        from collections import defaultdict
        
        matches = self.get_queryset().filter(
            start_time__gte=timezone.now(),
            status=Match.Status.SCHEDULED
        ).order_by('league', 'start_time')
        
        grouped_matches = defaultdict(list)
        for match in matches:
            grouped_matches[match.league.name].append(
                MatchListSerializer(match).data
            )
        
        return Response(dict(grouped_matches))

