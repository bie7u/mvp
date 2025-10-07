from django.contrib import admin
from .models import Prediction, Ranking


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    """Admin configuration for Prediction model"""
    
    list_display = ['user', 'match', 'home_score', 'away_score', 'points_earned', 'created_at']
    list_filter = ['match__status', 'match__league', 'user__company', 'created_at']
    search_fields = ['user__email', 'match__home_team__name', 'match__away_team__name']
    ordering = ['-created_at']
    date_hierarchy = 'created_at'
    
    readonly_fields = ['points_earned', 'created_at', 'updated_at']


@admin.register(Ranking)
class RankingAdmin(admin.ModelAdmin):
    """Admin configuration for Ranking model"""
    
    list_display = ['user', 'company', 'period', 'total_points', 'rank', 'total_predictions', 'updated_at']
    list_filter = ['period', 'company', 'period_start']
    search_fields = ['user__email', 'company__name']
    ordering = ['company', 'period', 'rank']
    
    readonly_fields = ['updated_at']

