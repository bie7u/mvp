from django.db import models
from django.core.validators import MinValueValidator


class Company(models.Model):
    """Company model for B2B platform"""
    
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Scoring configuration
    points_correct_score = models.IntegerField(
        default=3,
        validators=[MinValueValidator(0)],
        help_text='Points for predicting exact score'
    )
    points_correct_outcome = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)],
        help_text='Points for predicting correct winner/draw'
    )
    
    class Meta:
        db_table = 'companies'
        verbose_name_plural = 'companies'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class CompanyLeague(models.Model):
    """Association between companies and leagues they can predict"""
    
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='company_leagues'
    )
    league = models.ForeignKey(
        'matches.League',
        on_delete=models.CASCADE,
        related_name='company_leagues'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'company_leagues'
        unique_together = ['company', 'league']
        ordering = ['company', 'league']
    
    def __str__(self):
        return f"{self.company.name} - {self.league.name}"

