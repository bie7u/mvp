# Contributing to Football Match Prediction Platform

Thank you for your interest in contributing to the Football Match Prediction Platform! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/mvp.git
   cd mvp
   ```

2. **Run the setup script**
   ```bash
   ./setup.sh
   ```

3. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Backend Development

1. **Make changes to Django code**
   ```bash
   # Access the backend container
   docker-compose exec backend bash
   
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   
   # Run tests
   pytest
   ```

2. **Add new Django app**
   ```bash
   docker-compose exec backend python manage.py startapp app_name
   ```

### Frontend Development

1. **Make changes to React code**
   ```bash
   cd frontend
   npm start  # Run development server
   ```

2. **Run linting**
   ```bash
   npm run lint
   ```

3. **Run tests**
   ```bash
   npm test
   ```

## Coding Standards

### Python/Django

- Follow PEP 8 style guide
- Use meaningful variable and function names
- Add docstrings to all functions and classes
- Keep functions small and focused
- Use type hints where appropriate

Example:
```python
def calculate_points(prediction: Prediction, match: Match) -> int:
    """
    Calculate points earned for a prediction.
    
    Args:
        prediction: The user's prediction
        match: The actual match result
        
    Returns:
        Points earned (0, 1, or 3)
    """
    # Implementation
```

### JavaScript/React

- Use functional components with hooks
- Follow ESLint rules
- Use meaningful component and variable names
- Keep components small and reusable
- Use PropTypes or TypeScript for type checking

Example:
```javascript
const MatchCard = ({ match, onPredict }) => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  
  // Component implementation
};
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first approach
- Keep custom CSS minimal
- Use consistent spacing and colors

## Testing

### Backend Tests

```bash
# Run all tests
docker-compose exec backend pytest

# Run with coverage
docker-compose exec backend pytest --cov=.

# Run specific test file
docker-compose exec backend pytest apps/users/tests.py

# Run specific test
docker-compose exec backend pytest apps/users/tests.py::TestUserModel::test_create_user
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test Login.test.js
```

### Writing Tests

- Write tests for all new features
- Aim for at least 80% code coverage
- Test edge cases and error conditions
- Use descriptive test names

Example backend test:
```python
@pytest.mark.django_db
def test_prediction_points_calculation():
    """Test that prediction points are calculated correctly"""
    # Setup
    # Test
    # Assert
```

Example frontend test:
```javascript
test('renders login form with username and password fields', () => {
  render(<Login />);
  expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
});
```

## Pull Request Process

1. **Update your branch**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests**
   ```bash
   # Backend
   docker-compose exec backend pytest
   
   # Frontend
   cd frontend && npm test
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```
   
   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

4. **Push your changes**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub and create a PR
   - Fill in the PR template
   - Link related issues
   - Request review from maintainers

6. **PR Review Process**
   - Address review comments
   - Update PR as needed
   - Ensure CI/CD passes
   - Wait for approval

## Project Structure

```
mvp/
├── backend/
│   ├── apps/              # Django apps
│   │   ├── users/         # User management
│   │   ├── companies/     # Company management
│   │   ├── leagues/       # League management
│   │   ├── matches/       # Match data
│   │   ├── predictions/   # User predictions
│   │   └── rankings/      # Rankings
│   ├── config/            # Django settings
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── public/
└── docker-compose.yml
```

## API Endpoints

When adding new endpoints, update the API documentation:

1. Add endpoint to appropriate router
2. Write serializers
3. Add permissions
4. Update API documentation in README
5. Add tests

## Database Migrations

1. Create migrations:
   ```bash
   docker-compose exec backend python manage.py makemigrations
   ```

2. Review migration file

3. Apply migrations:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

4. Commit migration files

## Environment Variables

- Never commit `.env` files
- Update `.env.example` when adding new variables
- Document all environment variables in README

## Questions?

- Open an issue for bugs
- Use discussions for questions
- Join our community chat (if available)

Thank you for contributing! 🎉
