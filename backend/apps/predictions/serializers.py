from rest_framework import serializers
from .models import Prediction
from apps.matches.serializers import MatchSerializer

class PredictionSerializer(serializers.ModelSerializer):
    """Serializer for Prediction model"""
    match_details = MatchSerializer(source='match', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Prediction
        fields = ['id', 'user', 'username', 'match', 'match_details', 
                  'home_score', 'away_score', 'points_earned', 
                  'created_at', 'updated_at']
        read_only_fields = ['user', 'points_earned', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Check if match has started
        match = data.get('match')
        if match and match.is_prediction_locked:
            raise serializers.ValidationError("Cannot create or update prediction after match has started.")
        
        # Validate scores are non-negative
        if data.get('home_score', 0) < 0 or data.get('away_score', 0) < 0:
            raise serializers.ValidationError("Scores cannot be negative.")
        
        return data

class PredictionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating predictions"""
    
    class Meta:
        model = Prediction
        fields = ['match', 'home_score', 'away_score']
    
    def validate(self, data):
        # Check if match has started
        match = data.get('match')
        if match and match.is_prediction_locked:
            raise serializers.ValidationError("Cannot create prediction after match has started.")
        
        # Validate scores are non-negative
        if data.get('home_score', 0) < 0 or data.get('away_score', 0) < 0:
            raise serializers.ValidationError("Scores cannot be negative.")
        
        return data
