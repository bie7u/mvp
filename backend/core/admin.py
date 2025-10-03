from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Client, Match, Bet, Point, Badge, UserBadge


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'client', 'points', 'is_active']
    list_filter = ['role', 'is_active', 'client']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'client', 'points')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role', 'client')}),
    )


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['home_team', 'away_team', 'match_date', 'status', 'home_score', 'away_score']
    list_filter = ['status', 'league', 'match_date']
    search_fields = ['home_team', 'away_team', 'league']
    date_hierarchy = 'match_date'


@admin.register(Bet)
class BetAdmin(admin.ModelAdmin):
    list_display = ['user', 'match', 'predicted_home_score', 'predicted_away_score', 
                    'points_earned', 'is_processed', 'created_at']
    list_filter = ['is_processed', 'created_at']
    search_fields = ['user__username', 'match__home_team', 'match__away_team']
    date_hierarchy = 'created_at'


@admin.register(Point)
class PointAdmin(admin.ModelAdmin):
    list_display = ['user', 'points', 'reason', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'reason']
    date_hierarchy = 'created_at'


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'badge_type', 'icon', 'requirement']
    list_filter = ['badge_type']
    search_fields = ['name', 'description']


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'badge', 'earned_at']
    list_filter = ['badge', 'earned_at']
    search_fields = ['user__username', 'badge__name']
    date_hierarchy = 'earned_at'

