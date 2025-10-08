from rest_framework import serializers
from .models import Ranking

class RankingSerializer(serializers.ModelSerializer):
    """Serializer for Ranking model"""
    username = serializers.CharField(source='user.username', read_only=True)
    user_nickname = serializers.CharField(source='user.nickname', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    period_display = serializers.CharField(source='get_period_display', read_only=True)
    
    class Meta:
        model = Ranking
        fields = ['id', 'user', 'username', 'user_nickname', 'company', 'company_name',
                  'period', 'period_display', 'period_identifier', 'total_points', 
                  'rank', 'updated_at']
        read_only_fields = ['total_points', 'rank', 'updated_at']
