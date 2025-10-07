from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings


class Prediction(models.Model):
    """User prediction for a match"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    match = models.ForeignKey(
        'matches.Match',
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    home_score = models.IntegerField(
        validators=[MinValueValidator(0)]
    )
    away_score = models.IntegerField(
        validators=[MinValueValidator(0)]
    )
    points_earned = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'predictions'
        unique_together = ['user', 'match']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'match']),
            models.Index(fields=['match', 'points_earned']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.match}"
    
    def calculate_points(self):
        """Calculate points based on company scoring rules"""
        if not self.match.is_finished():
            return 0
        
        company = self.user.company
        if not company:
            return 0
        
        # Check for exact score
        if (self.home_score == self.match.home_score and 
            self.away_score == self.match.away_score):
            return company.points_correct_score
        
        # Check for correct outcome (win/draw/loss)
        predicted_diff = self.home_score - self.away_score
        actual_diff = self.match.home_score - self.match.away_score
        
        # Same outcome (both positive, both negative, or both zero)
        if ((predicted_diff > 0 and actual_diff > 0) or
            (predicted_diff < 0 and actual_diff < 0) or
            (predicted_diff == 0 and actual_diff == 0)):
            return company.points_correct_outcome
        
        return 0


class Ranking(models.Model):
    """User ranking within a company"""
    
    class Period(models.TextChoices):
        WEEK = 'WEEK', 'Week'
        MONTH = 'MONTH', 'Month'
        SEASON = 'SEASON', 'Season'
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rankings'
    )
    company = models.ForeignKey(
        'companies.Company',
        on_delete=models.CASCADE,
        related_name='rankings'
    )
    period = models.CharField(
        max_length=10,
        choices=Period.choices
    )
    period_start = models.DateField()
    period_end = models.DateField()
    total_points = models.IntegerField(default=0)
    total_predictions = models.IntegerField(default=0)
    correct_scores = models.IntegerField(default=0)
    correct_outcomes = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rankings'
        unique_together = ['user', 'company', 'period', 'period_start']
        ordering = ['-total_points', 'user']
        indexes = [
            models.Index(fields=['company', 'period', '-total_points']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.company.name} - {self.period}"

