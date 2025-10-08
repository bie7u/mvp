from django.contrib import admin
from .models import Match

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['home_team', 'away_team', 'league', 'kickoff_time', 'status', 'home_score', 'away_score']
    list_filter = ['league', 'status', 'kickoff_time']
    search_fields = ['home_team', 'away_team']
    ordering = ['-kickoff_time']
