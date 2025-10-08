from django.test import TestCase
from django.core.management import call_command
from io import StringIO


class JobsTestCase(TestCase):
    """Test cases for django-extensions jobs"""
    
    def test_jobs_are_registered(self):
        """Test that jobs are properly registered"""
        out = StringIO()
        call_command('runjobs', '--list', stdout=out)
        output = out.getvalue()
        
        # Check that our jobs are listed
        self.assertIn('update_match_data', output)
        self.assertIn('quarter_hourly', output)
        
    def test_update_match_data_job_exists(self):
        """Test that update_match_data job can be imported"""
        from matches.jobs.quarter_hourly.update_match_data import Job
        self.assertTrue(hasattr(Job, 'execute'))

