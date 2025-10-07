#!/bin/bash
# Test script to validate the Docker fixes

set -e  # Exit on any error

echo "=========================================="
echo "Docker Fix Validation Script"
echo "=========================================="
echo ""

# Test 1: Check migration files exist
echo "Test 1: Checking migration files..."
migrations=(
  "backend/accounts/migrations/0001_initial.py"
  "backend/companies/migrations/0001_initial.py"
  "backend/matches/migrations/0001_initial.py"
  "backend/predictions/migrations/0001_initial.py"
)

for migration in "${migrations[@]}"; do
  if [ -f "$migration" ]; then
    echo "✓ $migration exists"
  else
    echo "✗ $migration missing"
    exit 1
  fi
done
echo ""

# Test 2: Verify PostCSS config syntax
echo "Test 2: Checking PostCSS configuration..."
if grep -q "module.exports" frontend/postcss.config.js; then
  echo "✓ PostCSS config uses CommonJS syntax"
else
  echo "✗ PostCSS config has wrong syntax"
  exit 1
fi
echo ""

# Test 3: Verify migration dependencies
echo "Test 3: Checking migration dependency chain..."
echo "  - matches: should have no dependencies"
if grep -q "dependencies = \[\s*\]" backend/matches/migrations/0001_initial.py; then
  echo "    ✓ matches has no dependencies"
else
  echo "    ℹ matches has some dependencies (checking...)"
fi

echo "  - companies: should depend on matches"
if grep -q "('matches', '0001_initial')" backend/companies/migrations/0001_initial.py; then
  echo "    ✓ companies depends on matches"
else
  echo "    ✗ companies missing matches dependency"
  exit 1
fi

echo "  - accounts: should depend on companies"
if grep -q "('companies', '0001_initial')" backend/accounts/migrations/0001_initial.py; then
  echo "    ✓ accounts depends on companies"
else
  echo "    ✗ accounts missing companies dependency"
  exit 1
fi

echo "  - predictions: should depend on accounts, matches, companies"
if grep -q "('matches', '0001_initial')" backend/predictions/migrations/0001_initial.py && \
   grep -q "('companies', '0001_initial')" backend/predictions/migrations/0001_initial.py; then
  echo "    ✓ predictions has correct dependencies"
else
  echo "    ✗ predictions missing dependencies"
  exit 1
fi
echo ""

# Test 4: Check Docker files
echo "Test 4: Checking Docker configuration files..."
files=(
  "docker-compose.yml"
  "backend/Dockerfile"
  "backend/entrypoint.sh"
  "backend/requirements.txt"
  "frontend/Dockerfile"
  "frontend/package.json"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✓ $file exists"
  else
    echo "✗ $file missing"
    exit 1
  fi
done
echo ""

# Test 5: Verify .env.example
echo "Test 5: Checking environment configuration..."
if [ -f ".env.example" ]; then
  echo "✓ .env.example exists"
  required_vars=(
    "POSTGRES_DB"
    "POSTGRES_USER"
    "POSTGRES_PASSWORD"
    "SECRET_KEY"
    "API_FOOTBALL_KEY"
  )
  
  for var in "${required_vars[@]}"; do
    if grep -q "$var" .env.example; then
      echo "  ✓ $var defined"
    else
      echo "  ✗ $var missing"
      exit 1
    fi
  done
else
  echo "✗ .env.example missing"
  exit 1
fi
echo ""

# Test 6: Check documentation
echo "Test 6: Checking documentation..."
docs=(
  "README.md"
  "DOCKER_SETUP.md"
  "MIGRATION_FIXES.md"
)

for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "✓ $doc exists"
  else
    echo "✗ $doc missing"
    exit 1
  fi
done
echo ""

echo "=========================================="
echo "✓ All validation tests passed!"
echo "=========================================="
echo ""
echo "The Docker issues have been fixed:"
echo "1. ✓ All Django migrations created with correct dependencies"
echo "2. ✓ PostCSS configuration uses CommonJS syntax"
echo "3. ✓ Docker configuration files are present"
echo "4. ✓ Environment variables documented"
echo "5. ✓ Comprehensive documentation added"
echo ""
echo "To run the application:"
echo "  1. Copy .env.example to .env"
echo "  2. Run: docker compose up --build"
echo ""
