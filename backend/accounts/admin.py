from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'company', 'is_active', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff', 'company']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'nickname', 'profile_photo')}),
        (_('Permissions'), {'fields': ('role', 'company', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Notifications'), {'fields': ('email_notifications',)}),
        (_('Invitation'), {'fields': ('is_invited', 'invitation_token', 'invitation_sent_at')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'company'),
        }),
    )

