from django_crontab.crontab import CronJobBase, Schedule
from .tasks import update_rankings


class UpdateRankingsCronJob(CronJobBase):
    """Cron job to update rankings every hour"""
    
    RUN_EVERY_MINS = 60
    
    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'predictions.update_rankings'
    
    def do(self):
        """Execute the rankings update task"""
        update_rankings()
