from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Client, Match, Bet, Point, Badge, UserBadge

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    badges_count = serializers.IntegerField(source='earned_badges.count', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'client', 'client_name', 'points', 'badges_count', 'is_active', 
                  'date_joined']
        read_only_fields = ['points', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'client']
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ClientSerializer(serializers.ModelSerializer):
    users_count = serializers.IntegerField(source='users.count', read_only=True)
    
    class Meta:
        model = Client
        fields = ['id', 'name', 'logo', 'primary_color', 'secondary_color', 
                  'is_active', 'users_count', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class MatchSerializer(serializers.ModelSerializer):
    bets_count = serializers.IntegerField(source='bets.count', read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'external_id', 'home_team', 'away_team', 'home_logo', 
                  'away_logo', 'match_date', 'status', 'home_score', 'away_score',
                  'league', 'season', 'round', 'venue', 'bets_count', 
                  'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class BetSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    match_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Bet
        fields = ['id', 'user', 'user_username', 'match', 'match_details',
                  'predicted_home_score', 'predicted_away_score', 'predicted_scorers',
                  'points_earned', 'is_processed', 'created_at', 'updated_at']
        read_only_fields = ['points_earned', 'is_processed', 'created_at', 'updated_at']
    
    def get_match_details(self, obj):
        return {
            'home_team': obj.match.home_team,
            'away_team': obj.match.away_team,
            'match_date': obj.match.match_date,
            'status': obj.match.status,
        }
    
    def validate(self, data):
        # Check if bet already exists for this user and match
        user = data.get('user', self.context['request'].user if self.context.get('request') else None)
        match = data.get('match')
        
        if self.instance is None:  # Creating new bet
            if Bet.objects.filter(user=user, match=match).exists():
                raise serializers.ValidationError("You have already placed a bet for this match.")
        
        # Check if match has already started
        from django.utils import timezone
        if match.match_date < timezone.now():
            raise serializers.ValidationError("Cannot place bet for a match that has already started.")
        
        return data


class BetCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bet
        fields = ['match', 'predicted_home_score', 'predicted_away_score', 'predicted_scorers']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PointSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Point
        fields = ['id', 'user', 'user_username', 'bet', 'points', 'reason', 'created_at']
        read_only_fields = ['created_at']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'badge_type', 'icon', 'requirement', 'created_at']
        read_only_fields = ['created_at']


class UserBadgeSerializer(serializers.ModelSerializer):
    badge_details = BadgeSerializer(source='badge', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'user', 'user_username', 'badge', 'badge_details', 'earned_at']
        read_only_fields = ['earned_at']


class LeaderboardSerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    user = UserSerializer()
    total_bets = serializers.IntegerField()
    winning_bets = serializers.IntegerField()
    accuracy = serializers.FloatField()
