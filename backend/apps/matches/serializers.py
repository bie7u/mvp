from rest_framework import serializers
from .models import Match

class MatchSerializer(serializers.ModelSerializer):
    """Serializer for Match model"""
    league_name = serializers.CharField(source='league.get_name_display', read_only=True)
    is_prediction_locked = serializers.BooleanField(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Match
        fields = ['id', 'league', 'league_name', 'api_football_id', 
                  'home_team', 'away_team', 'round', 'kickoff_time', 
                  'status', 'status_display', 'home_score', 'away_score',
                  'is_prediction_locked', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'is_prediction_locked']

class MatchCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating matches"""
    
    class Meta:
        model = Match
        fields = ['league', 'api_football_id', 'home_team', 'away_team', 
                  'round', 'kickoff_time', 'status']
