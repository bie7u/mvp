from rest_framework import serializers
from .models import Company, CompanyLeague
from matches.models import League


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model"""
    
    employee_count = serializers.SerializerMethodField()
    active_leagues = serializers.SerializerMethodField()
    
    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'is_active',
            'points_correct_score', 'points_correct_outcome',
            'created_at', 'updated_at', 'employee_count', 'active_leagues'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()
    
    def get_active_leagues(self, obj):
        return obj.company_leagues.filter(is_active=True).count()


class CompanyLeagueSerializer(serializers.ModelSerializer):
    """Serializer for CompanyLeague model"""
    
    league_name = serializers.CharField(source='league.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)
    
    class Meta:
        model = CompanyLeague
        fields = [
            'id', 'company', 'company_name', 'league', 
            'league_name', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CompanyScoringSerializer(serializers.ModelSerializer):
    """Serializer for updating company scoring rules"""
    
    class Meta:
        model = Company
        fields = ['points_correct_score', 'points_correct_outcome']
