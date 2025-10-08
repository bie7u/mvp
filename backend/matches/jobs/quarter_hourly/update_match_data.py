from django_extensions.management.jobs import QuarterHourlyJob
from matches.tasks import update_match_data


class Job(QuarterHourlyJob):
    """Job to update match data - runs every 15 minutes"""
    
    help = "Update match data from API-Football"
    
    def execute(self):
        """Execute the match data update task"""
        update_match_data()
