from rest_framework import serializers
from .models import Company, CompanyLeague, ScoringConfig

class CompanyLeagueSerializer(serializers.ModelSerializer):
    """Serializer for CompanyLeague model"""
    league_name = serializers.CharField(source='league.name', read_only=True)
    
    class Meta:
        model = CompanyLeague
        fields = ['id', 'league', 'league_name', 'assigned_at']

class ScoringConfigSerializer(serializers.ModelSerializer):
    """Serializer for ScoringConfig model"""
    
    class Meta:
        model = ScoringConfig
        fields = ['id', 'company', 'correct_score_points', 'correct_outcome_points']
        read_only_fields = ['company']

class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    leagues = CompanyLeagueSerializer(source='company_leagues', many=True, read_only=True)
    scoring_config = ScoringConfigSerializer(read_only=True)
    employee_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = ['id', 'name', 'description', 'created_at', 'updated_at', 
                  'is_active', 'leagues', 'scoring_config', 'employee_count']
    
    def get_employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()

class CompanyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating companies"""
    
    class Meta:
        model = Company
        fields = ['name', 'description', 'is_active']
