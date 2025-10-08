from django.core.management.base import BaseCommand
from django.db import connection
from django.db.utils import OperationalError
import time
import subprocess

class Command(BaseCommand):
    help = 'Run cron jobs to fetch match data periodically'

    def handle(self, *args, **options):
        # Wait for database migrations to be applied
        self.stdout.write('Waiting for database migrations...')
        max_retries = 30
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Try to access a table to verify migrations are complete
                from apps.leagues.models import League
                League.objects.count()
                self.stdout.write(self.style.SUCCESS('Database is ready!'))
                break
            except OperationalError:
                retry_count += 1
                self.stdout.write(f'Database not ready yet, retrying ({retry_count}/{max_retries})...')
                time.sleep(2)
        
        if retry_count >= max_retries:
            self.stdout.write(self.style.ERROR('Failed to connect to database after maximum retries'))
            return
        
        self.stdout.write('Starting cron job...')
        
        while True:
            self.stdout.write('Fetching match data...')
            try:
                subprocess.run(['python', 'manage.py', 'fetch_match_data'], check=True)
                self.stdout.write(self.style.SUCCESS('Match data fetched successfully'))
            except subprocess.CalledProcessError as e:
                self.stdout.write(self.style.ERROR(f'Error fetching match data: {str(e)}'))
            
            # Wait 5 minutes before next run
            self.stdout.write('Waiting 5 minutes...')
            time.sleep(300)
