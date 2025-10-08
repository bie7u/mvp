from django_extensions.management.jobs import HourlyJob
from predictions.tasks import update_rankings


class Job(HourlyJob):
    """Job to update rankings - runs every hour"""
    
    help = "Update rankings for all companies"
    
    def execute(self):
        """Execute the rankings update task"""
        update_rankings()
