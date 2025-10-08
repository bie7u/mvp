#!/bin/bash
# Validation script for database migration fixes

set -e

echo "=== Validating Database Migration Fixes ==="
echo ""

# Check if migration files exist
echo "1. Checking migration files..."
MIGRATION_COUNT=$(find backend/apps -type f -name "*.py" -path "*/migrations/*" ! -name "__init__.py" | wc -l)
echo "   Found $MIGRATION_COUNT migration files"

if [ "$MIGRATION_COUNT" -eq 8 ]; then
    echo "   ✓ All expected migrations are present"
else
    echo "   ✗ Expected 8 migrations but found $MIGRATION_COUNT"
    exit 1
fi

# Check if static directory exists
echo ""
echo "2. Checking static directory..."
if [ -d "backend/static" ]; then
    echo "   ✓ backend/static directory exists"
else
    echo "   ✗ backend/static directory is missing"
    exit 1
fi

# Check if .gitkeep exists
if [ -f "backend/static/.gitkeep" ]; then
    echo "   ✓ backend/static/.gitkeep exists"
else
    echo "   ✗ backend/static/.gitkeep is missing"
    exit 1
fi

# Check if runcron.py has the wait logic
echo ""
echo "3. Checking runcron.py for database wait logic..."
if grep -q "Waiting for database migrations" backend/apps/matches/management/commands/runcron.py; then
    echo "   ✓ runcron.py has database wait logic"
else
    echo "   ✗ runcron.py is missing database wait logic"
    exit 1
fi

# List all apps with migrations
echo ""
echo "4. Apps with migrations:"
for app in backend/apps/*/migrations; do
    app_name=$(basename $(dirname $app))
    migration_count=$(find $app -type f -name "*.py" ! -name "__init__.py" | wc -l)
    echo "   - $app_name: $migration_count migration(s)"
done

echo ""
echo "=== All validations passed! ==="
echo ""
echo "To test the complete setup:"
echo "1. Clean up existing containers: docker compose down -v"
echo "2. Start services: docker compose up --build"
echo "3. Watch for:"
echo "   - Backend successfully running migrations"
echo "   - Cron service waiting for database to be ready"
echo "   - No 'relation does not exist' errors"
echo "   - No static directory warnings"
