import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Celery Beat Schedule
app.conf.beat_schedule = {
    'update-match-data-every-5-minutes': {
        'task': 'matches.tasks.update_match_data',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'update-rankings-hourly': {
        'task': 'predictions.tasks.update_rankings',
        'schedule': crontab(minute=0),  # Every hour
    },
}

app.conf.timezone = 'UTC'


@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
