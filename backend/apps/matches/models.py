from django.db import models

class Match(models.Model):
    """Match model for football matches"""
    
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('finished', 'Finished'),
        ('postponed', 'Postponed'),
        ('cancelled', 'Cancelled'),
    )
    
    league = models.ForeignKey('leagues.League', on_delete=models.CASCADE, related_name='matches')
    api_football_id = models.IntegerField(unique=True, null=True, blank=True)
    home_team = models.CharField(max_length=200)
    away_team = models.CharField(max_length=200)
    round = models.CharField(max_length=50)
    kickoff_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.home_team} vs {self.away_team} - {self.league.get_name_display()}"
    
    class Meta:
        ordering = ['-kickoff_time']
        verbose_name_plural = 'Matches'
    
    @property
    def is_prediction_locked(self):
        """Check if predictions are locked (match has started)"""
        from django.utils import timezone
        return timezone.now() >= self.kickoff_time
