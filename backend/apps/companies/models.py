from django.db import models

class Company(models.Model):
    """Company model for B2B clients"""
    
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['name']

class CompanyLeague(models.Model):
    """Many-to-many relationship between Company and League with assignment date"""
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='company_leagues')
    league = models.ForeignKey('leagues.League', on_delete=models.CASCADE, related_name='league_companies')
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['company', 'league']
        ordering = ['company', 'league']
    
    def __str__(self):
        return f"{self.company.name} - {self.league.name}"

class ScoringConfig(models.Model):
    """Scoring configuration per company"""
    
    company = models.OneToOneField(Company, on_delete=models.CASCADE, related_name='scoring_config')
    correct_score_points = models.IntegerField(default=3)
    correct_outcome_points = models.IntegerField(default=1)
    
    def __str__(self):
        return f"Scoring Config for {self.company.name}"
    
    class Meta:
        verbose_name = 'Scoring Configuration'
        verbose_name_plural = 'Scoring Configurations'
