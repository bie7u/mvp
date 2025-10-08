from django.db import models

class League(models.Model):
    """League model for football leagues"""
    
    LEAGUE_CHOICES = (
        ('premier_league', 'Premier League'),
        ('la_liga', 'La Liga'),
        ('bundesliga', 'Bundesliga'),
        ('serie_a', 'Serie A'),
        ('ligue_1', 'Ligue 1'),
        ('ekstraklasa', 'Ekstraklasa'),
    )
    
    name = models.CharField(max_length=100, choices=LEAGUE_CHOICES, unique=True)
    api_football_id = models.IntegerField(unique=True, null=True, blank=True)
    country = models.CharField(max_length=100)
    season = models.CharField(max_length=10)  # e.g., "2023-2024"
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_name_display()} ({self.season})"
    
    class Meta:
        ordering = ['name']
        unique_together = ['name', 'season']
