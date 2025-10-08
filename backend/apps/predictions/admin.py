from django.contrib import admin
from .models import Prediction

@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ['user', 'match', 'home_score', 'away_score', 'points_earned', 'created_at']
    list_filter = ['user__company', 'match__league', 'created_at']
    search_fields = ['user__username', 'match__home_team', 'match__away_team']
    readonly_fields = ['points_earned']
