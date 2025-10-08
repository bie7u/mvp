from django.contrib import admin
from .models import League

@admin.register(League)
class LeagueAdmin(admin.ModelAdmin):
    list_display = ['name', 'country', 'season', 'is_active', 'api_football_id']
    list_filter = ['name', 'country', 'season', 'is_active']
    search_fields = ['name', 'country']
