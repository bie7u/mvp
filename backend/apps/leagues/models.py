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
    
    name = models.CharField(max_length=100, choices=LEAGUE_CHOICES)
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


class Standing(models.Model):
    """League standings/table for teams"""
    
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='standings')
    rank = models.IntegerField()
    team_name = models.CharField(max_length=200)
    team_logo = models.URLField(blank=True, null=True)
    played = models.IntegerField(default=0)
    won = models.IntegerField(default=0)
    drawn = models.IntegerField(default=0)
    lost = models.IntegerField(default=0)
    goals_for = models.IntegerField(default=0)
    goals_against = models.IntegerField(default=0)
    goal_difference = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    form = models.CharField(max_length=50, blank=True)  # e.g., "WWDLL"
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['league', 'rank']
        unique_together = ['league', 'team_name']
        verbose_name_plural = 'Standings'
    
    def __str__(self):
        return f"{self.rank}. {self.team_name} ({self.league.get_name_display()})"
