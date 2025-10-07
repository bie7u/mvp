from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Custom user model with role-based access control"""
    
    class Role(models.TextChoices):
        ROOT_ADMIN = 'ROOT_ADMIN', _('Root Admin')
        CLIENT_ADMIN = 'CLIENT_ADMIN', _('Client Admin')
        EMPLOYEE = 'EMPLOYEE', _('Employee')
    
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.EMPLOYEE,
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='employees',
        null=True,
        blank=True,
    )
    nickname = models.CharField(max_length=100, blank=True)
    profile_photo = models.ImageField(
        upload_to='profile_photos/',
        null=True,
        blank=True,
    )
    email_notifications = models.BooleanField(default=True)
    is_invited = models.BooleanField(default=False)
    invitation_token = models.CharField(max_length=255, blank=True)
    invitation_sent_at = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']
    
    def __str__(self):
        return self.email
    
    def is_root_admin(self):
        return self.role == self.Role.ROOT_ADMIN
    
    def is_client_admin(self):
        return self.role == self.Role.CLIENT_ADMIN
    
    def is_employee(self):
        return self.role == self.Role.EMPLOYEE

