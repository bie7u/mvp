from django.contrib import admin
from .models import League, Team, Match


@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    """Admin configuration for League model"""
    
    list_display = ['name', 'code', 'country', 'current_season', 'is_active']
    list_filter = ['is_active', 'code', 'country']
    search_fields = ['name', 'country']
    ordering = ['name']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    """Admin configuration for Team model"""
    
    list_display = ['name', 'code', 'country', 'api_id']
    list_filter = ['country']
    search_fields = ['name', 'code']
    ordering = ['name']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """Admin configuration for Match model"""
    
    list_display = ['home_team', 'away_team', 'league', 'start_time', 'status', 'home_score', 'away_score']
    list_filter = ['status', 'league', 'season', 'start_time']
    search_fields = ['home_team__name', 'away_team__name']
    ordering = ['-start_time']
    date_hierarchy = 'start_time'

