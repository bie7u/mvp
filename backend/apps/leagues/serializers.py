from rest_framework import serializers
from .models import League

class LeagueSerializer(serializers.ModelSerializer):
    """Serializer for League model"""
    league_display_name = serializers.CharField(source='get_name_display', read_only=True)
    
    class Meta:
        model = League
        fields = ['id', 'name', 'league_display_name', 'api_football_id', 
                  'country', 'season', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
