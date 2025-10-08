# Cron Jobs Migration Summary

## Overview
Successfully migrated from Celery Beat scheduled tasks to django-extensions jobs system.

## Changes Made

### 1. Dependencies
- **Added**: `django-extensions>=3.2,<4.0` to requirements.txt
- **Added**: `django_extensions` to INSTALLED_APPS

### 2. Removed Celery Beat Configuration
- Removed `beat_schedule` configuration from `backend/config/celery.py`
- Removed `celery-beat` service from `docker-compose.yml`

### 3. Converted Tasks
Modified `backend/matches/tasks.py`:
- Removed `@shared_task` decorator from `update_match_data()`
- Removed `@shared_task` decorator from `fetch_leagues()`
- Changed `.delay()` call to direct function call

Modified `backend/predictions/tasks.py`:
- Removed `@shared_task` decorator from `calculate_prediction_points()`
- Removed `@shared_task` decorator from `update_rankings()`
- Removed `@shared_task` decorator from `update_company_rankings()`
- Changed all `.delay()` calls to direct function calls

### 4. Created Jobs
Created django-extensions job structure:

**matches app:**
```
backend/matches/jobs/
├── __init__.py
└── quarter_hourly/
    ├── __init__.py
    └── update_match_data.py  # Job class for updating match data
```

**predictions app:**
```
backend/predictions/jobs/
├── __init__.py
└── hourly/
    ├── __init__.py
    └── update_rankings.py  # Job class for updating rankings
```

### 5. Added Cron Service
Added new `cron` service to `docker-compose.yml` that:
- Runs quarter_hourly jobs every 15 minutes
- Runs hourly jobs every hour
- Executes jobs in background using Django management commands

### 6. Documentation
- Created `CRON_JOBS.md` with comprehensive setup instructions
- Added tests to verify job registration

## How to Use

### Manual Execution
```bash
# List all jobs
python manage.py runjobs --list

# Run quarter hourly jobs (match data update)
python manage.py runjobs quarter_hourly

# Run hourly jobs (rankings update)
python manage.py runjobs hourly
```

### Automated Execution (Docker)
The new `cron` service in docker-compose.yml automatically runs jobs at their scheduled intervals.

### System Cron Setup
See `CRON_JOBS.md` for instructions on setting up with system cron.

## Benefits

1. **Simpler Architecture**: No need for separate celery-beat service
2. **Standard Cron**: Uses familiar cron-based scheduling
3. **Management Commands**: Jobs run as Django management commands
4. **No Extra Tables**: Doesn't require django-celery-beat database tables
5. **Easy Testing**: Jobs can be easily tested with `runjobs` command

## Files Modified

- `backend/config/celery.py` - Removed beat schedule
- `backend/config/settings.py` - Added django_extensions
- `backend/matches/tasks.py` - Removed @shared_task decorators
- `backend/predictions/tasks.py` - Removed @shared_task decorators
- `backend/requirements.txt` - Added django-extensions
- `docker-compose.yml` - Removed celery-beat, added cron service
- `backend/matches/tests.py` - Added job tests
- `backend/predictions/tests.py` - Added job tests

## Files Created

- `CRON_JOBS.md` - Comprehensive documentation
- `backend/matches/jobs/` - Job directory structure
- `backend/predictions/jobs/` - Job directory structure

## Jobs Schedule

| Job Name | Frequency | Description |
|----------|-----------|-------------|
| update_match_data | Every 15 minutes (quarter_hourly) | Updates match data from API-Football |
| update_rankings | Every hour (hourly) | Updates rankings for all companies |

## Migration Complete ✓

All changes have been tested and verified:
- ✓ Jobs are properly registered
- ✓ Jobs can be listed with `runjobs --list`
- ✓ Tasks converted from Celery to regular functions
- ✓ Documentation created
- ✓ Docker setup updated
