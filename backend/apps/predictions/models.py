from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Prediction(models.Model):
    """Prediction model for user match predictions"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    match = models.ForeignKey('matches.Match', on_delete=models.CASCADE, related_name='predictions')
    home_score = models.IntegerField()
    away_score = models.IntegerField()
    points_earned = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'match']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.match} - {self.home_score}:{self.away_score}"
    
    def calculate_points(self):
        """Calculate points based on prediction and actual result"""
        if self.match.status != 'finished' or self.match.home_score is None or self.match.away_score is None:
            return 0
        
        # Get scoring config from user's company
        scoring_config = self.user.company.scoring_config if self.user.company else None
        correct_score_points = scoring_config.correct_score_points if scoring_config else 3
        correct_outcome_points = scoring_config.correct_outcome_points if scoring_config else 1
        
        # Check for exact score match
        if self.home_score == self.match.home_score and self.away_score == self.match.away_score:
            return correct_score_points
        
        # Check for correct outcome (win/draw/loss)
        predicted_outcome = self._get_outcome(self.home_score, self.away_score)
        actual_outcome = self._get_outcome(self.match.home_score, self.match.away_score)
        
        if predicted_outcome == actual_outcome:
            return correct_outcome_points
        
        return 0
    
    def _get_outcome(self, home_score, away_score):
        """Get match outcome (home win, draw, away win)"""
        if home_score > away_score:
            return 'home_win'
        elif home_score < away_score:
            return 'away_win'
        else:
            return 'draw'
    
    def save(self, *args, **kwargs):
        # Calculate points on save if match is finished
        if self.match.status == 'finished':
            self.points_earned = self.calculate_points()
        super().save(*args, **kwargs)
