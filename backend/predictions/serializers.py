from rest_framework import serializers
from django.utils import timezone
from .models import Prediction, Ranking
from matches.models import Match


class PredictionSerializer(serializers.ModelSerializer):
    """Serializer for Prediction model"""
    
    match_home_team = serializers.CharField(source='match.home_team.name', read_only=True)
    match_away_team = serializers.CharField(source='match.away_team.name', read_only=True)
    match_start_time = serializers.DateTimeField(source='match.start_time', read_only=True)
    match_status = serializers.CharField(source='match.status', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_nickname = serializers.CharField(source='user.nickname', read_only=True)
    
    class Meta:
        model = Prediction
        fields = [
            'id', 'user', 'user_email', 'user_nickname', 'match',
            'match_home_team', 'match_away_team', 'match_start_time', 'match_status',
            'home_score', 'away_score', 'points_earned', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'points_earned', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        request = self.context.get('request')
        match = attrs.get('match')
        
        # Check if match has already started
        if match and match.is_started():
            raise serializers.ValidationError(
                "Cannot create or update prediction for a match that has already started"
            )
        
        # For updates, check the existing prediction's match
        if self.instance and self.instance.match.is_started():
            raise serializers.ValidationError(
                "Cannot update prediction for a match that has already started"
            )
        
        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class PredictionCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating predictions"""
    
    class Meta:
        model = Prediction
        fields = ['match', 'home_score', 'away_score']
    
    def validate_match(self, value):
        if value.is_started():
            raise serializers.ValidationError(
                "Cannot predict a match that has already started"
            )
        return value


class RankingSerializer(serializers.ModelSerializer):
    """Serializer for Ranking model"""
    
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_nickname = serializers.CharField(source='user.nickname', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = Ranking
        fields = [
            'id', 'user', 'user_email', 'user_nickname', 'user_full_name',
            'company', 'company_name', 'period', 'period_start', 'period_end',
            'total_points', 'total_predictions', 'correct_scores', 
            'correct_outcomes', 'rank', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
    
    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email


class UserStatsSerializer(serializers.Serializer):
    """Serializer for user statistics"""
    
    total_predictions = serializers.IntegerField()
    total_points = serializers.IntegerField()
    correct_scores = serializers.IntegerField()
    correct_outcomes = serializers.IntegerField()
    accuracy_percentage = serializers.FloatField()
    rank = serializers.IntegerField()
