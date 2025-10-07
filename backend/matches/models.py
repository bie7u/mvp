from django.db import models
from django.utils import timezone


class League(models.Model):
    """Football league model"""
    
    # Top 5 European leagues + Polish Ekstraklasa
    LEAGUE_CHOICES = [
        ('premier_league', 'Premier League (England)'),
        ('la_liga', 'La Liga (Spain)'),
        ('bundesliga', 'Bundesliga (Germany)'),
        ('serie_a', 'Serie A (Italy)'),
        ('ligue_1', 'Ligue 1 (France)'),
        ('ekstraklasa', 'Ekstraklasa (Poland)'),
    ]
    
    name = models.CharField(max_length=100)
    code = models.CharField(
        max_length=50,
        choices=LEAGUE_CHOICES,
        unique=True
    )
    country = models.CharField(max_length=100)
    api_id = models.IntegerField(
        unique=True,
        help_text='League ID from API-Football'
    )
    current_season = models.IntegerField(
        help_text='Current season year'
    )
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'leagues'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Team(models.Model):
    """Football team model"""
    
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=10, blank=True)
    api_id = models.IntegerField(
        unique=True,
        help_text='Team ID from API-Football'
    )
    country = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'teams'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Match(models.Model):
    """Football match model"""
    
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        IN_PLAY = 'IN_PLAY', 'In Play'
        FINISHED = 'FINISHED', 'Finished'
        POSTPONED = 'POSTPONED', 'Postponed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    api_id = models.IntegerField(
        unique=True,
        help_text='Match ID from API-Football'
    )
    league = models.ForeignKey(
        League,
        on_delete=models.CASCADE,
        related_name='matches'
    )
    home_team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='home_matches'
    )
    away_team = models.ForeignKey(
        Team,
        on_delete=models.CASCADE,
        related_name='away_matches'
    )
    start_time = models.DateTimeField()
    round = models.CharField(max_length=50)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED
    )
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    season = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'matches'
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['league', 'start_time']),
            models.Index(fields=['status', 'start_time']),
        ]
    
    def __str__(self):
        return f"{self.home_team.name} vs {self.away_team.name}"
    
    def is_started(self):
        """Check if match has started"""
        return timezone.now() >= self.start_time
    
    def is_finished(self):
        """Check if match is finished"""
        return self.status == self.Status.FINISHED

