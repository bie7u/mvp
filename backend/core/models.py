from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator


class User(AbstractUser):
    """Custom User model with role-based permissions"""
    ROLE_CHOICES = [
        ('root_admin', 'Root Admin'),
        ('client_admin', 'Client Admin'),
        ('user', 'User'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')
    client = models.ForeignKey('Client', on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    points = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.username} ({self.role})"


class Client(models.Model):
    """Client organization with branding settings"""
    name = models.CharField(max_length=255)
    logo = models.URLField(blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    secondary_color = models.CharField(max_length=7, default='#10B981')  # Hex color
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']


class Match(models.Model):
    """Football match data"""
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('live', 'Live'),
        ('finished', 'Finished'),
        ('postponed', 'Postponed'),
        ('cancelled', 'Cancelled'),
    ]
    
    external_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    home_team = models.CharField(max_length=255)
    away_team = models.CharField(max_length=255)
    home_logo = models.URLField(blank=True, null=True)
    away_logo = models.URLField(blank=True, null=True)
    match_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    league = models.CharField(max_length=255, blank=True)
    season = models.CharField(max_length=50, blank=True)
    round = models.CharField(max_length=50, blank=True)
    venue = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.home_team} vs {self.away_team} - {self.match_date.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['match_date']


class Bet(models.Model):
    """User predictions for matches"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bets')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='bets')
    predicted_home_score = models.IntegerField(validators=[MinValueValidator(0)])
    predicted_away_score = models.IntegerField(validators=[MinValueValidator(0)])
    predicted_scorers = models.JSONField(default=list, blank=True)  # List of player names
    points_earned = models.IntegerField(default=0)
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.match}"
    
    class Meta:
        unique_together = ['user', 'match']
        ordering = ['-created_at']
    
    def calculate_points(self):
        """Calculate points based on prediction accuracy"""
        if not self.match.home_score is None and not self.match.away_score is None:
            points = 0
            
            # Exact score match: 10 points
            if (self.predicted_home_score == self.match.home_score and 
                self.predicted_away_score == self.match.away_score):
                points += 10
            # Correct goal difference: 5 points
            elif ((self.predicted_home_score - self.predicted_away_score) == 
                  (self.match.home_score - self.match.away_score)):
                points += 5
            # Correct winner: 3 points
            elif ((self.predicted_home_score > self.predicted_away_score and 
                   self.match.home_score > self.match.away_score) or
                  (self.predicted_home_score < self.predicted_away_score and 
                   self.match.home_score < self.match.away_score) or
                  (self.predicted_home_score == self.predicted_away_score and 
                   self.match.home_score == self.match.away_score)):
                points += 3
            
            self.points_earned = points
            self.is_processed = True
            self.save()
            
            # Update user's total points
            self.user.points = sum(bet.points_earned for bet in self.user.bets.all())
            self.user.save()
            
            return points
        return 0


class Point(models.Model):
    """Point history for tracking user scores"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='point_history')
    bet = models.ForeignKey(Bet, on_delete=models.CASCADE, related_name='point_records')
    points = models.IntegerField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.points} points"
    
    class Meta:
        ordering = ['-created_at']


class Badge(models.Model):
    """Achievement badges for gamification"""
    BADGE_TYPES = [
        ('first_bet', 'First Bet'),
        ('winning_streak', 'Winning Streak'),
        ('exact_score', 'Exact Score Master'),
        ('top_scorer', 'Top Scorer'),
        ('perfect_week', 'Perfect Week'),
        ('super_predictor', 'Super Predictor'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    badge_type = models.CharField(max_length=50, choices=BADGE_TYPES)
    icon = models.CharField(max_length=50, default='🏆')
    requirement = models.IntegerField(help_text="Threshold to earn this badge")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['badge_type']


class UserBadge(models.Model):
    """Tracks badges earned by users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='earned_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_to')
    earned_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"
    
    class Meta:
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
