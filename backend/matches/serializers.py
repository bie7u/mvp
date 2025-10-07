from rest_framework import serializers
from .models import League, Team, Match


class LeagueSerializer(serializers.ModelSerializer):
    """Serializer for League model"""
    
    class Meta:
        model = League
        fields = [
            'id', 'name', 'code', 'country', 
            'api_id', 'current_season', 'is_active'
        ]
        read_only_fields = ['id']


class TeamSerializer(serializers.ModelSerializer):
    """Serializer for Team model"""
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'code', 'api_id', 'country']
        read_only_fields = ['id']


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for Match model"""
    
    home_team_name = serializers.CharField(source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(source='away_team.name', read_only=True)
    league_name = serializers.CharField(source='league.name', read_only=True)
    is_started = serializers.SerializerMethodField()
    is_finished = serializers.SerializerMethodField()
    user_prediction = serializers.SerializerMethodField()
    
    class Meta:
        model = Match
        fields = [
            'id', 'api_id', 'league', 'league_name',
            'home_team', 'home_team_name', 'away_team', 'away_team_name',
            'start_time', 'round', 'status', 'home_score', 'away_score',
            'season', 'is_started', 'is_finished', 'user_prediction',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_is_started(self, obj):
        return obj.is_started()
    
    def get_is_finished(self, obj):
        return obj.is_finished()
    
    def get_user_prediction(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            prediction = obj.predictions.filter(user=request.user).first()
            if prediction:
                from predictions.serializers import PredictionSerializer
                return PredictionSerializer(prediction).data
        return None


class MatchListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for match list"""
    
    home_team_name = serializers.CharField(source='home_team.name', read_only=True)
    away_team_name = serializers.CharField(source='away_team.name', read_only=True)
    league_name = serializers.CharField(source='league.name', read_only=True)
    
    class Meta:
        model = Match
        fields = [
            'id', 'league_name', 'home_team_name', 'away_team_name',
            'start_time', 'round', 'status', 'home_score', 'away_score'
        ]
