from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Sum

User = get_user_model()

class Ranking(models.Model):
    """Ranking model for tracking user scores"""
    
    PERIOD_CHOICES = (
        ('week', 'Week'),
        ('month', 'Month'),
        ('season', 'Season'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rankings')
    company = models.ForeignKey('companies.Company', on_delete=models.CASCADE, related_name='rankings')
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    period_identifier = models.CharField(max_length=50)  # e.g., "2024-W01", "2024-01", "2023-2024"
    total_points = models.IntegerField(default=0)
    rank = models.IntegerField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'company', 'period', 'period_identifier']
        ordering = ['-total_points', 'user__username']
        indexes = [
            models.Index(fields=['company', 'period', 'period_identifier', '-total_points']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.company.name} - {self.period} {self.period_identifier}: {self.total_points} pts"
    
    @classmethod
    def update_rankings(cls, company, period, period_identifier):
        """Update rankings for a specific company, period and identifier"""
        from apps.predictions.models import Prediction
        from django.db.models import Q
        from datetime import datetime, timedelta
        
        # Determine date range based on period
        if period == 'week':
            # Parse week identifier (e.g., "2024-W01")
            year, week = period_identifier.split('-W')
            # Calculate week start and end
            # This is simplified; proper week calculation would be more complex
            pass
        elif period == 'month':
            # Parse month identifier (e.g., "2024-01")
            year, month = period_identifier.split('-')
            # Calculate month start and end
            pass
        # For season, we'd need start and end dates
        
        # Get all users in company
        users = User.objects.filter(company=company, is_active=True)
        
        for user in users:
            # Calculate total points for the period
            # This is a simplified version; actual implementation would filter by date range
            total_points = Prediction.objects.filter(
                user=user,
                match__status='finished'
            ).aggregate(total=Sum('points_earned'))['total'] or 0
            
            # Update or create ranking
            ranking, created = cls.objects.update_or_create(
                user=user,
                company=company,
                period=period,
                period_identifier=period_identifier,
                defaults={'total_points': total_points}
            )
        
        # Update ranks
        rankings = cls.objects.filter(
            company=company,
            period=period,
            period_identifier=period_identifier
        ).order_by('-total_points', 'user__username')
        
        for idx, ranking in enumerate(rankings, start=1):
            ranking.rank = idx
            ranking.save(update_fields=['rank'])
