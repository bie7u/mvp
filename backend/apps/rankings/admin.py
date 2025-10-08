from django.contrib import admin
from .models import Ranking

@admin.register(Ranking)
class RankingAdmin(admin.ModelAdmin):
    list_display = ['user', 'company', 'period', 'period_identifier', 'total_points', 'rank']
    list_filter = ['company', 'period', 'period_identifier']
    search_fields = ['user__username', 'company__name']
    readonly_fields = ['total_points', 'rank', 'updated_at']
