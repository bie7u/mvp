from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom User model with roles and notification preferences"""
    
    ROLE_CHOICES = (
        ('root_admin', 'Root Admin'),
        ('client_admin', 'Client Admin'),
        ('employee', 'Employee'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, null=True, blank=True, related_name='employees')
    nickname = models.CharField(max_length=100, blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    email_notifications = models.BooleanField(default=True)
    is_invited = models.BooleanField(default=False)
    invitation_token = models.CharField(max_length=100, blank=True, null=True, unique=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    class Meta:
        ordering = ['username']
