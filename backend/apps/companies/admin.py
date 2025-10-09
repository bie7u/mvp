from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import Company, CompanyLeague, ScoringConfig

User = get_user_model()


class CompanyLeagueInline(admin.TabularInline):
    """Inline admin for managing company leagues"""
    model = CompanyLeague
    extra = 1
    autocomplete_fields = ['league']


class CompanyUserInline(admin.TabularInline):
    """Inline admin for managing company users"""
    model = User
    fk_name = 'company'
    extra = 0
    fields = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active']
    readonly_fields = ['username']
    can_delete = False
    verbose_name = 'Company User'
    verbose_name_plural = 'Company Users'
    
    def has_add_permission(self, request, obj=None):
        # Users should be created through the User admin
        return False


class ScoringConfigInline(admin.StackedInline):
    """Inline admin for scoring configuration"""
    model = ScoringConfig
    can_delete = False
    verbose_name = 'Scoring Configuration'


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'user_count', 'league_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    inlines = [ScoringConfigInline, CompanyLeagueInline, CompanyUserInline]
    
    def user_count(self, obj):
        """Display number of users in the company"""
        return obj.employees.count()
    user_count.short_description = 'Users'
    
    def league_count(self, obj):
        """Display number of leagues assigned to the company"""
        return obj.company_leagues.count()
    league_count.short_description = 'Leagues'

@admin.register(CompanyLeague)
class CompanyLeagueAdmin(admin.ModelAdmin):
    list_display = ['company', 'league', 'assigned_at']
    list_filter = ['company', 'league']

@admin.register(ScoringConfig)
class ScoringConfigAdmin(admin.ModelAdmin):
    list_display = ['company', 'correct_score_points', 'correct_outcome_points']
    list_filter = ['company']
