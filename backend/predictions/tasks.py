from django.utils import timezone
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta
import logging

from .models import Prediction, Ranking
from matches.models import Match

logger = logging.getLogger(__name__)


def calculate_prediction_points(match_id):
    """Calculate points for all predictions of a finished match"""
    
    try:
        match = Match.objects.get(id=match_id)
        
        if not match.is_finished() or match.home_score is None:
            logger.warning(f"Match {match_id} is not finished or has no score")
            return
        
        predictions = Prediction.objects.filter(match=match)
        
        for prediction in predictions:
            points = prediction.calculate_points()
            prediction.points_earned = points
            prediction.save(update_fields=['points_earned'])
        
        logger.info(f"Calculated points for {predictions.count()} predictions for match {match_id}")
        
        # Update rankings for affected users
        company_ids = predictions.values_list('user__company_id', flat=True).distinct()
        for company_id in company_ids:
            if company_id:
                update_company_rankings(company_id)
        
    except Match.DoesNotExist:
        logger.error(f"Match {match_id} not found")
    except Exception as e:
        logger.error(f"Error calculating prediction points for match {match_id}: {str(e)}")


def update_rankings():
    """Update rankings for all companies"""
    
    from companies.models import Company
    
    companies = Company.objects.filter(is_active=True)
    
    for company in companies:
        update_company_rankings(company.id)
    
    logger.info(f"Triggered ranking updates for {companies.count()} companies")
    return "Rankings update triggered"


def update_company_rankings(company_id):
    """Update rankings for a specific company"""
    
    from companies.models import Company
    from accounts.models import User
    
    try:
        company = Company.objects.get(id=company_id)
        now = timezone.now()
        
        # Update weekly rankings
        week_start = (now - timedelta(days=now.weekday())).replace(
            hour=0, minute=0, second=0, microsecond=0
        ).date()
        week_end = (week_start + timedelta(days=6))
        
        update_period_rankings(
            company,
            Ranking.Period.WEEK,
            week_start,
            week_end
        )
        
        # Update monthly rankings
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).date()
        if now.month == 12:
            month_end = now.replace(month=1, day=1, year=now.year+1) - timedelta(days=1)
        else:
            month_end = now.replace(month=now.month+1, day=1) - timedelta(days=1)
        month_end = month_end.date()
        
        update_period_rankings(
            company,
            Ranking.Period.MONTH,
            month_start,
            month_end
        )
        
        # Update season rankings (assuming season is current year)
        season_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0).date()
        season_end = now.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999).date()
        
        update_period_rankings(
            company,
            Ranking.Period.SEASON,
            season_start,
            season_end
        )
        
        logger.info(f"Updated rankings for company {company.name}")
        
    except Company.DoesNotExist:
        logger.error(f"Company {company_id} not found")
    except Exception as e:
        logger.error(f"Error updating rankings for company {company_id}: {str(e)}")


def update_period_rankings(company, period, period_start, period_end):
    """Update rankings for a specific period"""
    
    from accounts.models import User
    
    employees = User.objects.filter(
        company=company,
        is_active=True,
        role=User.Role.EMPLOYEE
    )
    
    ranking_data = []
    
    for user in employees:
        # Get predictions in the period
        predictions = Prediction.objects.filter(
            user=user,
            match__start_time__date__gte=period_start,
            match__start_time__date__lte=period_end,
            match__status=Match.Status.FINISHED
        )
        
        total_predictions = predictions.count()
        total_points = predictions.aggregate(
            total=Sum('points_earned')
        )['total'] or 0
        
        # Count correct scores and outcomes
        correct_scores = 0
        correct_outcomes = 0
        
        for pred in predictions:
            if (pred.home_score == pred.match.home_score and 
                pred.away_score == pred.match.away_score):
                correct_scores += 1
            else:
                # Check for correct outcome
                pred_diff = pred.home_score - pred.away_score
                actual_diff = pred.match.home_score - pred.match.away_score
                if ((pred_diff > 0 and actual_diff > 0) or
                    (pred_diff < 0 and actual_diff < 0) or
                    (pred_diff == 0 and actual_diff == 0)):
                    correct_outcomes += 1
        
        ranking_data.append({
            'user': user,
            'total_predictions': total_predictions,
            'total_points': total_points,
            'correct_scores': correct_scores,
            'correct_outcomes': correct_outcomes,
        })
    
    # Sort by total points (descending)
    ranking_data.sort(key=lambda x: x['total_points'], reverse=True)
    
    # Update or create rankings with rank
    for rank, data in enumerate(ranking_data, start=1):
        Ranking.objects.update_or_create(
            user=data['user'],
            company=company,
            period=period,
            period_start=period_start,
            defaults={
                'period_end': period_end,
                'total_points': data['total_points'],
                'total_predictions': data['total_predictions'],
                'correct_scores': data['correct_scores'],
                'correct_outcomes': data['correct_outcomes'],
                'rank': rank,
            }
        )
    
    logger.info(f"Updated {len(ranking_data)} rankings for {company.name} - {period}")
