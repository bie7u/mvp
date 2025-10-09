from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'company', 'is_active', 'created_date']
    list_filter = ['role', 'company', 'is_active', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    autocomplete_fields = ['company']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'company', 'nickname', 'profile_picture', 
                                        'email_notifications', 'is_invited', 'invitation_token')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'company', 
                      'first_name', 'last_name', 'is_active'),
        }),
    )
    
    def created_date(self, obj):
        """Display formatted creation date"""
        return obj.date_joined.strftime('%Y-%m-%d')
    created_date.short_description = 'Created'
    created_date.admin_order_field = 'date_joined'
