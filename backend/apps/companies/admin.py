from django.contrib import admin
from .models import Company, CompanyLeague, ScoringConfig

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']

@admin.register(CompanyLeague)
class CompanyLeagueAdmin(admin.ModelAdmin):
    list_display = ['company', 'league', 'assigned_at']
    list_filter = ['company', 'league']

@admin.register(ScoringConfig)
class ScoringConfigAdmin(admin.ModelAdmin):
    list_display = ['company', 'correct_score_points', 'correct_outcome_points']
    list_filter = ['company']
