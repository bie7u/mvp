from django.contrib import admin
from .models import League, Standing

@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'season', 'is_active', 'api_football_id']
    list_filter = ['name', 'country', 'season', 'is_active']
    search_fields = ['name', 'country', 'season']


@admin.register(Standing)
class StandingAdmin(admin.ModelAdmin):
    list_display = ['rank', 'team_name', 'league', 'played', 'won', 'drawn', 'lost', 'goal_difference', 'points']
    list_filter = ['league']
    search_fields = ['team_name']
    ordering = ['league', 'rank']
    readonly_fields = ['updated_at']
