from django_crontab.crontab import CronJobBase, Schedule
from .tasks import update_match_data, fetch_leagues


class UpdateMatchDataCronJob(CronJobBase):
    """Cron job to update match data every 5 minutes"""
    
    RUN_EVERY_MINS = 5
    
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'matches.update_match_data'
    
    def do(self):
        """Execute the match data update task"""
        update_match_data()


class FetchLeaguesCronJob(CronJobBase):
    """Cron job to fetch leagues data - can be scheduled as needed"""
    
    schedule = Schedule(run_every_mins=1440)  # Daily
    code = 'matches.fetch_leagues'
    
    def do(self):
        """Execute the fetch leagues task"""
        fetch_leagues()
