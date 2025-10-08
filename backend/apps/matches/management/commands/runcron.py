from django.core.management.base import BaseCommand
import time
import subprocess

class Command(BaseCommand):
    help = 'Run cron jobs to fetch match data periodically'

    def handle(self, *args, **options):
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
