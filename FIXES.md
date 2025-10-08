# Database Migration and Setup Fixes

## Summary

This PR fixes critical database migration issues that were preventing the application from starting correctly. The main problems were:
1. Missing database migrations causing table creation failures
2. Cron service starting before database migrations were complete
3. Missing static files directory

## Issues Fixed

### 1. Missing Database Migrations
**Problem**: The Django applications had models defined but no migration files, causing the error:
```
django.db.utils.ProgrammingError: relation "leagues_league" does not exist
LINE 1: ...."created_at", "leagues_league"."updated_at" FROM "leagues_l...
```

**Root Cause**: The repository had Django models but no migration files in the `migrations/` directories.

**Solution**: Created initial migrations for all Django apps:
- **companies** (1 migration): Company, ScoringConfig, CompanyLeague models
- **leagues** (1 migration): League model
- **matches** (1 migration): Match model
- **predictions** (2 migrations): Prediction model with dependencies
- **rankings** (2 migrations): Ranking model with dependencies  
- **users** (1 migration): Custom User model extending AbstractUser

**Files Added**:
- `backend/apps/companies/migrations/0001_initial.py`
- `backend/apps/leagues/migrations/0001_initial.py`
- `backend/apps/matches/migrations/0001_initial.py`
- `backend/apps/predictions/migrations/0001_initial.py`
- `backend/apps/predictions/migrations/0002_initial.py`
- `backend/apps/rankings/migrations/0001_initial.py`
- `backend/apps/rankings/migrations/0002_initial.py`
- `backend/apps/users/migrations/0001_initial.py`
- Plus `__init__.py` files for each migrations directory

### 2. Cron Service Starting Too Early
**Problem**: The cron service was attempting to query the database immediately on startup, before the backend service had completed running migrations, resulting in:
```
cron-1 | django.db.utils.ProgrammingError: relation "leagues_league" does not exist
cron-1 | Error fetching match data: Command '['python', 'manage.py', 'fetch_match_data']' returned non-zero exit status 1.
```

**Root Cause**: Docker Compose `depends_on` only ensures the container starts, not that migrations are complete. The cron job tried to query `League.objects.filter(is_active=True)` before the tables existed.

**Solution**: Modified `backend/apps/matches/management/commands/runcron.py` to:
- Wait for the database to be ready before starting the cron loop
- Retry connection up to 30 times with 2-second delays between attempts
- Verify tables exist by attempting to query the League model
- Only start fetching match data once the database tables exist

**Files Modified**:
- `backend/apps/matches/management/commands/runcron.py` (added database wait logic)

### 3. Missing Static Directory
**Problem**: Django was warning about a missing static directory:
```
WARNINGS:
?: (staticfiles.W004) The directory '/app/static' in the STATICFILES_DIRS setting does not exist.
```

**Root Cause**: The `backend/static/` directory referenced in `settings.py` didn't exist in the repository.

**Solution**: 
- Created `backend/static/` directory with a `.gitkeep` file to track in git
- Updated `.gitignore` to allow tracking of `backend/static/` while still ignoring other static directories (like `staticfiles/`)

**Files Added**:
- `backend/static/.gitkeep`

**Files Modified**:
- `.gitignore` (added exception for `backend/static/`)

## Validation

A validation script (`validate-fixes.sh`) has been added to verify all fixes are correctly applied. Run it with:

```bash
./validate-fixes.sh
```

Expected output:
```
=== Validating Database Migration Fixes ===

1. Checking migration files...
   Found 8 migration files
   ✓ All expected migrations are present

2. Checking static directory...
   ✓ backend/static directory exists
   ✓ backend/static/.gitkeep exists

3. Checking runcron.py for database wait logic...
   ✓ runcron.py has database wait logic

...
=== All validations passed! ===
```

## Testing the Complete Setup

To verify the fixes work in a real environment:

1. **Clean up any existing containers and volumes**:
   ```bash
   docker compose down -v --remove-orphans
   ```

2. **Build and start the services**:
   ```bash
   docker compose up --build
   ```

3. **What you should see**:
   - ✅ Database container starts and becomes healthy
   - ✅ Backend runs migrations successfully: `Running migrations: No migrations to apply.` (after initial run) or `Applying...` messages
   - ✅ Backend starts gunicorn successfully
   - ✅ Cron service waits for database: `Waiting for database migrations...`
   - ✅ Cron service confirms ready: `Database is ready!`
   - ✅ No "relation does not exist" errors
   - ✅ No static directory warnings
   - ✅ All services running successfully

4. **What you should NOT see**:
   - ❌ `relation "leagues_league" does not exist`
   - ❌ `The directory '/app/static' in the STATICFILES_DIRS setting does not exist`
   - ❌ Cron service crashing immediately on startup

## Note on Orphan Containers

The warning about orphan containers (`mvp-celery-beat-1` and `mvp-redis-1`) indicates these were from a previous configuration. These services are not in the current `docker-compose.yml`. To clean them up:

```bash
docker compose down --remove-orphans
```

This is safe and will only remove containers that are no longer defined in the current `docker-compose.yml`.

## Files Changed

- **Modified**:
  - `.gitignore`
  - `backend/apps/matches/management/commands/runcron.py`

- **Added**:
  - `FIXES.md` (this file)
  - `validate-fixes.sh`
  - `backend/static/.gitkeep`
  - All migration files (8 total) in `backend/apps/*/migrations/`

## Migration Order

The migrations have proper dependencies configured:
1. `companies` (independent)
2. `leagues` (independent)
3. `users` (depends on companies)
4. `matches` (depends on leagues)
5. `predictions` (depends on matches and users)
6. `rankings` (depends on companies and users)

Django will automatically apply them in the correct order.
