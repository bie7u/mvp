# API Documentation

Base URL: `http://localhost:8000/api`

## Authentication

All API endpoints (except login and registration) require JWT authentication.

### Headers
```
Authorization: Bearer <access_token>
```

### Obtain Token

**POST** `/token/`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token

**POST** `/token/refresh/`

Request:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

## User Management

### Get Current User Profile

**GET** `/accounts/users/profile/`

Response:
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "user",
  "first_name": "John",
  "last_name": "Doe",
  "nickname": "JD",
  "profile_photo": null,
  "role": "EMPLOYEE",
  "company": 1,
  "company_name": "Demo Company",
  "email_notifications": true,
  "date_joined": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

### Update Profile

**PUT/PATCH** `/accounts/users/profile/`

Request:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "nickname": "Johnny",
  "email_notifications": true
}
```

### Change Password

**POST** `/accounts/users/change_password/`

Request:
```json
{
  "old_password": "oldpass123",
  "new_password": "newpass123"
}
```

### Invite User (Admin Only)

**POST** `/accounts/users/invite/`

Request:
```json
{
  "email": "newuser@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "EMPLOYEE",
  "company": 1
}
```

### Register via Invitation

**POST** `/accounts/register/`

Request:
```json
{
  "email": "newuser@example.com",
  "username": "janesmith",
  "first_name": "Jane",
  "last_name": "Smith",
  "password": "password123",
  "password_confirm": "password123",
  "invitation_token": "abc123...",
  "nickname": "Jane"
}
```

## Companies

### List Companies

**GET** `/companies/companies/`

Query Parameters:
- `is_active`: Filter by active status (true/false)

Response:
```json
[
  {
    "id": 1,
    "name": "Demo Company",
    "description": "A demo company",
    "is_active": true,
    "points_correct_score": 3,
    "points_correct_outcome": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "employee_count": 10,
    "active_leagues": 6
  }
]
```

### Get Company Statistics

**GET** `/companies/companies/{id}/statistics/`

Response:
```json
{
  "company_id": 1,
  "company_name": "Demo Company",
  "total_employees": 10,
  "total_predictions": 150,
  "total_points": 450,
  "avg_predictions_per_user": 15.0
}
```

### Update Company Scoring (Root Admin)

**PUT/PATCH** `/companies/companies/{id}/scoring/`

Request:
```json
{
  "points_correct_score": 5,
  "points_correct_outcome": 2
}
```

## Leagues

### List Leagues

**GET** `/matches/leagues/`

Query Parameters:
- `code`: Filter by league code
- `is_active`: Filter by active status

Response:
```json
[
  {
    "id": 1,
    "name": "Premier League",
    "code": "premier_league",
    "country": "England",
    "api_id": 39,
    "current_season": 2024,
    "is_active": true
  }
]
```

## Matches

### List Matches

**GET** `/matches/matches/`

Query Parameters:
- `league`: Filter by league ID
- `league_code`: Filter by league code
- `status`: Filter by match status (SCHEDULED, IN_PLAY, FINISHED, etc.)
- `season`: Filter by season year
- `round`: Filter by round
- `upcoming`: Get only upcoming matches (true/false)
- `page`: Page number for pagination
- `page_size`: Number of results per page (default: 20, max: 100)

Response:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/matches/matches/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "league_name": "Premier League",
      "home_team_name": "Arsenal",
      "away_team_name": "Chelsea",
      "start_time": "2024-01-15T15:00:00Z",
      "round": "Regular Season - 20",
      "status": "SCHEDULED",
      "home_score": null,
      "away_score": null
    }
  ]
}
```

### Get Match Details

**GET** `/matches/matches/{id}/`

Response:
```json
{
  "id": 1,
  "api_id": 12345,
  "league": 1,
  "league_name": "Premier League",
  "home_team": 1,
  "home_team_name": "Arsenal",
  "away_team": 2,
  "away_team_name": "Chelsea",
  "start_time": "2024-01-15T15:00:00Z",
  "round": "Regular Season - 20",
  "status": "SCHEDULED",
  "home_score": null,
  "away_score": null,
  "season": 2024,
  "is_started": false,
  "is_finished": false,
  "user_prediction": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Get Upcoming Matches

**GET** `/matches/matches/upcoming/`

Returns next 20 upcoming matches.

### Get Matches by League

**GET** `/matches/matches/by_league/`

Returns upcoming matches grouped by league.

Response:
```json
{
  "Premier League": [
    {
      "id": 1,
      "league_name": "Premier League",
      "home_team_name": "Arsenal",
      "away_team_name": "Chelsea",
      "start_time": "2024-01-15T15:00:00Z",
      "round": "Regular Season - 20",
      "status": "SCHEDULED",
      "home_score": null,
      "away_score": null
    }
  ]
}
```

## Predictions

### List Predictions

**GET** `/predictions/predictions/`

Query Parameters:
- `match`: Filter by match ID
- `user`: Filter by user ID

Response:
```json
[
  {
    "id": 1,
    "user": 1,
    "user_email": "user@example.com",
    "user_nickname": "Player1",
    "match": 1,
    "match_home_team": "Arsenal",
    "match_away_team": "Chelsea",
    "match_start_time": "2024-01-15T15:00:00Z",
    "match_status": "SCHEDULED",
    "home_score": 2,
    "away_score": 1,
    "points_earned": 0,
    "created_at": "2024-01-14T10:00:00Z",
    "updated_at": "2024-01-14T10:00:00Z"
  }
]
```

### Get My Predictions

**GET** `/predictions/predictions/my_predictions/`

Returns all predictions for the authenticated user.

### Create Prediction

**POST** `/predictions/predictions/`

Request:
```json
{
  "match": 1,
  "home_score": 2,
  "away_score": 1
}
```

Response:
```json
{
  "id": 1,
  "user": 1,
  "match": 1,
  "home_score": 2,
  "away_score": 1,
  "points_earned": 0,
  "created_at": "2024-01-14T10:00:00Z",
  "updated_at": "2024-01-14T10:00:00Z"
}
```

### Update Prediction

**PUT/PATCH** `/predictions/predictions/{id}/`

Request:
```json
{
  "home_score": 3,
  "away_score": 1
}
```

### Bulk Create Predictions

**POST** `/predictions/predictions/bulk_create/`

Request:
```json
{
  "predictions": [
    {
      "match": 1,
      "home_score": 2,
      "away_score": 1
    },
    {
      "match": 2,
      "home_score": 1,
      "away_score": 1
    }
  ]
}
```

Response:
```json
{
  "created": 2,
  "predictions": [...],
  "errors": []
}
```

## Rankings

### List Rankings

**GET** `/predictions/rankings/`

Query Parameters:
- `company`: Filter by company ID
- `period`: Filter by period (WEEK, MONTH, SEASON)

Response:
```json
[
  {
    "id": 1,
    "user": 1,
    "user_email": "user@example.com",
    "user_nickname": "Player1",
    "user_full_name": "John Doe",
    "company": 1,
    "company_name": "Demo Company",
    "period": "SEASON",
    "period_start": "2024-01-01",
    "period_end": "2024-12-31",
    "total_points": 150,
    "total_predictions": 50,
    "correct_scores": 10,
    "correct_outcomes": 30,
    "rank": 1,
    "updated_at": "2024-01-15T12:00:00Z"
  }
]
```

### Get Current Season Rankings

**GET** `/predictions/rankings/current_season/`

Returns rankings for the current season.

### Get Current Month Rankings

**GET** `/predictions/rankings/current_month/`

Returns rankings for the current month.

### Get Current Week Rankings

**GET** `/predictions/rankings/current_week/`

Returns rankings for the current week.

### Get My Statistics

**GET** `/predictions/rankings/my_stats/`

Response:
```json
{
  "total_predictions": 50,
  "total_points": 150,
  "correct_scores": 10,
  "correct_outcomes": 30,
  "accuracy_percentage": 80.0,
  "rank": 1
}
```

## Error Responses

All endpoints may return error responses with the following format:

### 400 Bad Request
```json
{
  "field_name": ["Error message"],
  "another_field": ["Another error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "A server error occurred."
}
```

## Rate Limiting

Currently, there are no rate limits in development. Production environments should implement appropriate rate limiting.

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `page_size`: Number of results per page (default: varies by endpoint, max: 100)

Response format:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

## Interactive Documentation

For interactive API documentation with the ability to test endpoints, visit:

**http://localhost:8000/api/docs/**

This provides a Swagger UI interface with all available endpoints, parameters, and example requests/responses.
