from django.contrib import admin
from .models import Company, CompanyLeague


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin configuration for Company model"""
    
    list_display = ['name', 'is_active', 'points_correct_score', 'points_correct_outcome', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    fieldsets = (
        (None, {'fields': ('name', 'description', 'is_active')}),
        ('Scoring Configuration', {'fields': ('points_correct_score', 'points_correct_outcome')}),
    )


@admin.register(CompanyLeague)
class CompanyLeagueAdmin(admin.ModelAdmin):
    """Admin configuration for CompanyLeague model"""
    
    list_display = ['company', 'league', 'is_active', 'created_at']
    list_filter = ['is_active', 'league', 'company']
    search_fields = ['company__name', 'league__name']
    ordering = ['company', 'league']

