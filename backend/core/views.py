from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Avg
from django.utils import timezone
from .models import Client, Match, Bet, Point, Badge, UserBadge
from .serializers import (
    UserSerializer, UserCreateSerializer, ClientSerializer, MatchSerializer,
    BetSerializer, BetCreateSerializer, PointSerializer, BadgeSerializer,
    UserBadgeSerializer, LeaderboardSerializer
)

User = get_user_model()


class IsRootAdmin(permissions.BasePermission):
    """Only root admin users can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'root_admin'


class IsClientAdminOrRootAdmin(permissions.BasePermission):
    """Client admin and root admin can access"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['root_admin', 'client_admin']


class CanPredict(permissions.BasePermission):
    """Only client_admin and user roles can predict (not root_admin)"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['client_admin', 'user']


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for User management
    Root admins can manage all users, client admins can only view their client's users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsClientAdminOrRootAdmin()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'root_admin':
            return User.objects.all()
        elif user.role == 'client_admin':
            return User.objects.filter(client=user.client)
        else:
            return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user info"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class ClientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Client management
    Only root admins can create/update/delete clients
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRootAdmin()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get all users for a specific client"""
        client = self.get_object()
        users = User.objects.filter(client=client)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get statistics for a specific client"""
        client = self.get_object()
        users = User.objects.filter(client=client)
        
        stats = {
            'total_users': users.count(),
            'total_bets': Bet.objects.filter(user__client=client).count(),
            'total_points': sum(user.points for user in users),
            'active_users': users.filter(is_active=True).count(),
        }
        return Response(stats)


class MatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Match management
    Root admins can create/update matches, all authenticated users can view
    """
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRootAdmin()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming matches"""
        matches = Match.objects.filter(
            match_date__gte=timezone.now(),
            status='scheduled'
        ).order_by('match_date')[:10]
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent finished matches"""
        matches = Match.objects.filter(
            status='finished'
        ).order_by('-match_date')[:10]
        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_result(self, request, pk=None):
        """Update match result and process bets - Only root admins can do this"""
        if request.user.role != 'root_admin':
            return Response(
                {'error': 'Only root admins can update match results'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        match = self.get_object()
        home_score = request.data.get('home_score')
        away_score = request.data.get('away_score')
        
        if home_score is not None and away_score is not None:
            match.home_score = home_score
            match.away_score = away_score
            match.status = 'finished'
            match.save()
            
            # Process all bets for this match
            bets = Bet.objects.filter(match=match, is_processed=False)
            for bet in bets:
                bet.calculate_points()
            
            return Response({'message': 'Match result updated and bets processed'})
        
        return Response(
            {'error': 'home_score and away_score are required'},
            status=status.HTTP_400_BAD_REQUEST
        )


class BetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Bet management
    Only users with CanPredict permission (client_admin and user) can create bets
    Root admins cannot predict matches
    """
    queryset = Bet.objects.all()
    serializer_class = BetSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [CanPredict()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'root_admin':
            return Bet.objects.all()
        elif user.role == 'client_admin':
            return Bet.objects.filter(user__client=user.client)
        else:
            return Bet.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return BetCreateSerializer
        return BetSerializer
    
    @action(detail=False, methods=['get'])
    def my_bets(self, request):
        """Get current user's bets"""
        bets = Bet.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(bets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending bets (unprocessed)"""
        bets = self.get_queryset().filter(is_processed=False)
        serializer = self.get_serializer(bets, many=True)
        return Response(serializer.data)


class LeaderboardViewSet(viewsets.ViewSet):
    """
    ViewSet for leaderboard and rankings
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def global_ranking(self, request):
        """Get global leaderboard"""
        users = User.objects.filter(role='user').order_by('-points')[:50]
        
        leaderboard = []
        for rank, user in enumerate(users, 1):
            total_bets = user.bets.count()
            winning_bets = user.bets.filter(points_earned__gt=0).count()
            accuracy = (winning_bets / total_bets * 100) if total_bets > 0 else 0
            
            leaderboard.append({
                'rank': rank,
                'user': UserSerializer(user).data,
                'total_bets': total_bets,
                'winning_bets': winning_bets,
                'accuracy': round(accuracy, 2)
            })
        
        return Response(leaderboard)
    
    @action(detail=False, methods=['get'])
    def client_ranking(self, request):
        """Get client-specific leaderboard"""
        user = request.user
        if not user.client:
            return Response({'error': 'User not associated with any client'}, status=400)
        
        users = User.objects.filter(
            client=user.client,
            role='user'
        ).order_by('-points')[:50]
        
        leaderboard = []
        for rank, user in enumerate(users, 1):
            total_bets = user.bets.count()
            winning_bets = user.bets.filter(points_earned__gt=0).count()
            accuracy = (winning_bets / total_bets * 100) if total_bets > 0 else 0
            
            leaderboard.append({
                'rank': rank,
                'user': UserSerializer(user).data,
                'total_bets': total_bets,
                'winning_bets': winning_bets,
                'accuracy': round(accuracy, 2)
            })
        
        return Response(leaderboard)


class BadgeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Badge management
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRootAdmin()]
        return [permissions.IsAuthenticated()]


class UserBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing earned badges
    """
    queryset = UserBadge.objects.all()
    serializer_class = UserBadgeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'root_admin':
            return UserBadge.objects.all()
        else:
            return UserBadge.objects.filter(user=user)


class StatisticsViewSet(viewsets.ViewSet):
    """
    ViewSet for global statistics
    """
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get overview statistics"""
        stats = {
            'total_users': User.objects.filter(role='user').count(),
            'total_clients': Client.objects.filter(is_active=True).count(),
            'total_matches': Match.objects.count(),
            'total_bets': Bet.objects.count(),
            'upcoming_matches': Match.objects.filter(
                match_date__gte=timezone.now(),
                status='scheduled'
            ).count(),
            'finished_matches': Match.objects.filter(status='finished').count(),
        }
        return Response(stats)

