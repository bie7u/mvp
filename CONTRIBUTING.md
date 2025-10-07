# Contributing to Football Match Prediction Platform

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment details (OS, Docker version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- Use a clear and descriptive title
- Provide detailed description of the proposed feature
- Explain why this enhancement would be useful
- List any similar features in other applications

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Development Setup

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

Quick setup:
```bash
git clone https://github.com/bie7u/mvp.git
cd mvp
cp .env.example .env
docker-compose up --build
```

## Coding Standards

### Backend (Python/Django)

- Follow PEP 8 style guide
- Use meaningful variable and function names
- Write docstrings for classes and functions
- Keep functions small and focused
- Use type hints where appropriate

Example:
```python
def calculate_points(prediction: Prediction, match: Match) -> int:
    """
    Calculate points earned for a prediction based on match result.
    
    Args:
        prediction: User's prediction object
        match: Match object with final score
        
    Returns:
        Points earned (0, 1, or 3)
    """
    if not match.is_finished():
        return 0
    # ... implementation
```

### Frontend (React/JavaScript)

- Use functional components with hooks
- Follow React best practices
- Use meaningful component and variable names
- Keep components small and focused
- Use PropTypes or TypeScript for type checking

Example:
```jsx
function MatchCard({ match, onPredict }) {
  // Component implementation
}

MatchCard.propTypes = {
  match: PropTypes.object.isRequired,
  onPredict: PropTypes.func.isRequired,
};
```

### Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- First line should be 50 characters or less
- Reference issues and pull requests after first line

Example:
```
Add user invitation functionality

- Implement email invitation system
- Add invitation token generation
- Create invitation acceptance flow

Fixes #123
```

## Testing

### Backend Tests

```bash
# Run all tests
docker-compose exec backend python manage.py test

# Run specific app tests
docker-compose exec backend python manage.py test accounts

# Run with coverage
docker-compose exec backend coverage run --source='.' manage.py test
docker-compose exec backend coverage report
```

### Frontend Tests

```bash
# Run tests
docker-compose exec frontend npm test

# Run with coverage
docker-compose exec frontend npm test -- --coverage
```

### Writing Tests

- Write tests for new features
- Maintain or improve code coverage
- Test edge cases and error conditions
- Use descriptive test names

Example:
```python
class PredictionModelTest(TestCase):
    def test_calculate_points_exact_score(self):
        """Test that exact score prediction earns correct points"""
        # ... test implementation
```

## Database Migrations

When changing models:

```bash
# Create migrations
docker-compose exec backend python manage.py makemigrations

# Review the migration file
cat backend/<app>/migrations/0001_initial.py

# Apply migrations
docker-compose exec backend python manage.py migrate

# Test rollback
docker-compose exec backend python manage.py migrate <app> <previous_migration>
```

## API Documentation

- Document all API endpoints
- Include request/response examples
- Specify authentication requirements
- Document error responses

The API documentation is auto-generated using DRF Spectacular and available at `/api/docs/`.

## Project Structure

```
mvp/
├── backend/                # Django backend
│   ├── accounts/          # User management
│   ├── companies/         # Company management
│   ├── matches/           # Match data
│   ├── predictions/       # Predictions and rankings
│   └── config/            # Django settings
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── store/        # State management
│   └── public/           # Static assets
└── docker-compose.yml    # Docker configuration
```

## Adding New Features

### Backend Feature Checklist

- [ ] Create/update models in appropriate app
- [ ] Create serializers
- [ ] Create views/viewsets
- [ ] Add URL routes
- [ ] Write tests
- [ ] Update API documentation
- [ ] Add admin interface if needed
- [ ] Create migrations

### Frontend Feature Checklist

- [ ] Create/update components
- [ ] Add API service methods
- [ ] Update routing if needed
- [ ] Add to navigation if needed
- [ ] Write tests
- [ ] Ensure responsive design
- [ ] Add loading/error states

## Code Review Process

All submissions require review. We use GitHub pull requests for this purpose:

1. Submit PR with clear description
2. Ensure all tests pass
3. Ensure code follows style guidelines
4. Wait for review from maintainers
5. Address any feedback
6. Once approved, PR will be merged

## Release Process

1. Update version in relevant files
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Create tagged release
6. Deploy to production

## Documentation

- Update README.md for major changes
- Update API documentation
- Add inline code comments for complex logic
- Update QUICKSTART.md if setup changes
- Create migration guides for breaking changes

## Performance Guidelines

### Backend

- Use database indexes for frequently queried fields
- Optimize queries (use select_related, prefetch_related)
- Cache expensive operations
- Use pagination for large datasets
- Monitor query performance

### Frontend

- Lazy load components and routes
- Optimize images and assets
- Use React.memo for expensive components
- Debounce/throttle frequent operations
- Monitor bundle size

## Security

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Validate and sanitize user input
- Follow Django security best practices
- Keep dependencies updated
- Report security issues privately

## Questions?

- Open an issue for general questions
- Tag maintainers for urgent matters
- Join community discussions

Thank you for contributing! 🎉
