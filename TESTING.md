# Testing Guide - Admin Panel and Data Fixes

## Overview
This document provides step-by-step instructions to verify that all the fixes for the admin panel and data visibility issues are working correctly.

## Prerequisites
- Docker and Docker Compose installed
- At least 4GB of RAM available
- Ports 3000, 8000, and 5432 available

## Setup and Testing Steps

### 1. Clean Start (Optional but Recommended)

If you have an existing installation, clean it first:

```bash
# Stop and remove containers
docker-compose down

# Remove database volume to start fresh
docker volume rm mvp_postgres_data

# Clean build (optional)
docker-compose build --no-cache
```

### 2. Start the Application

```bash
# Build and start all services
docker-compose up --build -d

# Check that all services are running
docker-compose ps
```

Expected output: All services (db, backend, frontend, cron) should show "Up" status.

### 3. Run Database Migrations

```bash
# Apply all migrations
docker-compose exec backend python manage.py migrate

# Verify migrations were applied
docker-compose exec backend python manage.py showmigrations
```

Expected output: All migrations should show [X] indicating they're applied.

### 4. Seed Sample Data

```bash
# Run the seed_data command
docker-compose exec backend python manage.py seed_data
```

Expected output:
- Created root admin user (username: admin, password: admin123)
- Created leagues: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, Ekstraklasa
- Created Test Company
- Created scoring config for Test Company
- Created client admin user (username: client_admin, password: client123)
- Created employee users: employee1, employee2, employee3 (password: employee123)
- Created sample matches (upcoming and finished)
- Created sample predictions
- Created rankings

### 5. Verify Backend

```bash
# Check Django admin works
# Visit: http://localhost:8000/admin
# Login with: admin / admin123
```

Expected results in Django admin:
- ✅ Companies section should show "Test Company"
- ✅ Leagues section should show all 6 leagues
- ✅ Matches section should show 6 matches (3 upcoming, 3 finished)
- ✅ Predictions section should show predictions
- ✅ Rankings section should show rankings for the Test Company
- ✅ Users section should show all test users

### 6. Test Root Admin Frontend

```bash
# Visit: http://localhost:3000
# Login with: admin / admin123
```

Expected results:
1. **Navigation**
   - ✅ Should see "Admin Panel" link in navigation
   - ✅ Should see "Dashboard", "Rankings", and "Profile" links

2. **Admin Panel Page** (`/admin`)
   - **Companies Tab:**
     - ✅ Should show "Test Company" in the table
     - ✅ Should show employee count
     - ✅ Should have "Add Company" button
     - ✅ Should be able to delete companies
   
   - **Leagues Tab:**
     - ✅ Should show all 6 leagues with their details
     - ✅ Each league should show name, country, season, and active status
   
   - **Statistics Tab:**
     - ✅ Should show placeholder statistics cards

3. **Dashboard Page** (`/dashboard`)
   - ✅ Should show 3 upcoming matches
   - ✅ Each match should display:
     - League name (Premier League)
     - Round information
     - Home team vs Away team
     - Kickoff time
     - Prediction form (if not locked)

4. **Rankings Page** (`/rankings`)
   - ✅ Should show rankings table with employee rankings
   - ✅ Should show rank, user, and points
   - ✅ Should be able to switch between Week/Month/Season views

### 7. Test Client Admin Frontend

```bash
# Logout and login with: client_admin / client123
```

Expected results:
1. **Navigation**
   - ✅ Should see "Admin Panel" link (to company-admin)
   - ✅ Should see "Dashboard" and "Rankings" links

2. **Company Admin Panel** (`/company-admin`)
   - **Employees Tab:**
     - ✅ Should show all 3 employees in the table
     - ✅ Should have "Add Employee" button
     - ✅ Should be able to create new employees
     - ✅ Should show employee status (Active/Inactive)
   
   - **Rankings Tab:**
     - ✅ Should show company rankings
     - ✅ Should be able to switch periods

### 8. Test Employee Frontend

```bash
# Logout and login with: employee1 / employee123
```

Expected results:
1. **Navigation**
   - ✅ Should NOT see "Admin Panel" link
   - ✅ Should see "Dashboard", "Rankings", and "Profile" links

2. **Dashboard**
   - ✅ Should see upcoming matches
   - ✅ Should be able to make predictions on upcoming matches
   - ✅ Should see existing predictions on finished matches

3. **Rankings**
   - ✅ Should see own ranking highlighted
   - ✅ Should see other employees' rankings

### 9. Test Empty States

To test empty states, create a new company without data:

```bash
# Login as root admin (admin / admin123)
# Go to Admin Panel > Companies Tab
# Click "Add Company"
# Create a company called "Empty Company"

# Then create a new client admin for this company via Django admin
# Login as that new client admin
```

Expected results:
- ✅ Employees tab should show "No employees" empty state with helpful message
- ✅ Rankings tab should show "No rankings available" empty state
- ✅ Dashboard should show "No matches available" for employees

### 10. Verify Bug Fixes

#### League Model Unique Constraint Fix
```bash
# Try to create a league for a different season
docker-compose exec backend python manage.py shell

# In the shell:
from apps.leagues.models import League
league = League.objects.create(
    name='premier_league',
    season='2024-2025',  # Different season
    country='England',
    api_football_id=40,
    is_active=True
)
print(f"Created: {league}")
# Should succeed without errors
exit()
```

Expected: ✅ Should create successfully (previously would have failed due to unique constraint)

## Troubleshooting

### Issue: Migrations not applying
```bash
# Check migration status
docker-compose exec backend python manage.py showmigrations

# If needed, fake initial migrations
docker-compose exec backend python manage.py migrate --fake-initial
```

### Issue: No data showing up
```bash
# Check if seed_data ran successfully
docker-compose exec backend python manage.py shell
from apps.matches.models import Match
print(Match.objects.count())  # Should be 6
exit()
```

### Issue: Frontend not connecting to backend
```bash
# Check CORS settings
docker-compose logs backend | grep CORS

# Ensure backend .env has:
# CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Issue: Static files not found
```bash
# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput
```

## Success Criteria

All tests pass if:
- ✅ Root admin can see and manage companies
- ✅ Client admin can see and manage employees
- ✅ Employees can see matches and make predictions
- ✅ All users can see rankings
- ✅ Empty states display helpful messages
- ✅ No database constraint errors occur
- ✅ Sample data is created successfully

## Clean Up

After testing, you can keep the data or reset:

```bash
# Keep running
docker-compose down

# Or reset everything
docker-compose down -v
docker volume rm mvp_postgres_data
```

## Additional Notes

### Fetching Real Match Data

If you have an API-Football key, you can fetch real matches:

```bash
# Add your API key to backend/.env
echo "API_FOOTBALL_KEY=your-key-here" >> backend/.env

# Restart backend
docker-compose restart backend

# Fetch match data
docker-compose exec backend python manage.py fetch_match_data
```

### Running Tests (when database is available)

```bash
# Run all tests
docker-compose exec backend pytest

# Run specific app tests
docker-compose exec backend pytest apps/matches/tests.py
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```
