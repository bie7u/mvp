# Database Migration Fixes

## Issues Fixed

### 1. Missing Database Migrations
**Problem**: The Django applications had models defined but no migration files, causing the error:
```
django.db.utils.ProgrammingError: relation "leagues_league" does not exist
```

**Solution**: Created initial migrations for all Django apps:
- companies (Company, ScoringConfig, CompanyLeague models)
- leagues (League model)
- matches (Match model)
- predictions (Prediction model)
- rankings (Ranking model)  
- users (User model)

### 2. Cron Service Starting Too Early
**Problem**: The cron service was attempting to query the database immediately on startup, before the backend service had completed running migrations, resulting in:
```
cron-1 | django.db.utils.ProgrammingError: relation "leagues_league" does not exist
```

**Solution**: Modified `/backend/apps/matches/management/commands/runcron.py` to:
- Wait for the database to be ready before starting the cron loop
- Retry connection up to 30 times with 2-second delays
- Only start fetching match data once the database tables exist

### 3. Missing Static Directory
**Problem**: Django was warning about a missing static directory:
```
WARNINGS:
?: (staticfiles.W004) The directory '/app/static' in the STATICFILES_DIRS setting does not exist.
```

**Solution**: 
- Created `/backend/static/` directory with a `.gitkeep` file
- Updated `.gitignore` to allow tracking of `backend/static/` while still ignoring other static directories

## Testing

To verify the fixes work:

1. Clean up any existing containers:
```bash
docker compose down -v
```

2. Start the services:
```bash
docker compose up --build
```

3. You should see:
   - No "relation does not exist" errors
   - Backend successfully running migrations
   - Cron service waiting for database to be ready
   - No static directory warnings
   - All services starting successfully

## Note on Orphan Containers

The warning about orphan containers (`mvp-celery-beat-1` and `mvp-redis-1`) indicates these were from a previous configuration. To clean them up:

```bash
docker compose down --remove-orphans
```

This is safe and will only remove containers that are no longer defined in the current `docker-compose.yml`.
