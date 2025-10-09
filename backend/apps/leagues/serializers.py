from rest_framework import serializers
from .models import League, Standing

class LeagueSerializer(serializers.ModelSerializer):
    """Serializer for League model"""
    league_display_name = serializers.CharField(source='get_name_display', read_only=True)
    
    class Meta:
        model = League
        fields = ['id', 'name', 'league_display_name', 'api_football_id', 
                  'country', 'season', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class StandingSerializer(serializers.ModelSerializer):
    """Serializer for Standing model"""
    league_name = serializers.CharField(source='league.get_name_display', read_only=True)
    
    class Meta:
        model = Standing
        fields = ['id', 'league', 'league_name', 'rank', 'team_name', 'team_logo',
                  'played', 'won', 'drawn', 'lost', 'goals_for', 'goals_against',
                  'goal_difference', 'points', 'form', 'updated_at']
        read_only_fields = ['updated_at']
