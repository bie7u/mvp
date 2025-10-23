# HTTP-Only Cookie Authentication - Implementation Guide

## Quick Start

This application now uses secure HTTP-only cookie authentication. No code changes are needed to use authenticated API endpoints - cookies are handled automatically!

## For Developers

### Making Authenticated Requests

```javascript
import api from './services/api';

// Just make requests - cookies are sent automatically
const response = await api.get('/api/dashboard/stats');
```

### Using Authentication Context

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();

  // user contains: { id, name, email, role }
  // login(user) - call after successful login
  // logout() - clears cookies and redirects to login
  // loading - true while checking authentication
}
```

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description | Cookies Set |
|----------|--------|-------------|-------------|
| `/api/login` | POST | Login with email/password | accessToken (15min), refreshToken (7days) |
| `/api/logout` | POST | Clear authentication cookies | Clears all auth cookies |
| `/api/verify` | GET | Check if user is authenticated | None |
| `/api/refresh` | POST | Get new access token | accessToken (15min) |

### Example: Login Request

```javascript
const response = await authService.login('user@example.com', 'password');
// response.data contains: { user: { id, name, email, role } }
// Cookies are automatically set by the server
```

### Example: Protected Request

```javascript
// Access token is automatically sent via cookies
const stats = await dashboardService.getStats();
// If token expires, it's automatically refreshed
```

## How Token Refresh Works

1. You make an API request to a protected endpoint
2. If access token is expired, server returns 401
3. Axios interceptor automatically:
   - Calls `/api/refresh` with refresh token
   - Gets new access token
   - Retries your original request
4. If refresh fails, user is redirected to login

**You don't need to handle any of this manually!**

## Security Features

### HTTP-Only Cookies
- ✅ Tokens cannot be accessed by JavaScript
- ✅ Protected from XSS attacks
- ✅ Automatically sent with every request

### Token Expiration
- **Access Token**: 15 minutes (short-lived for security)
- **Refresh Token**: 7 days (long-lived for convenience)

### Cookie Attributes
- `HttpOnly`: JavaScript cannot access cookies
- `Secure`: Only sent over HTTPS (production)
- `SameSite=Strict`: Prevents CSRF attacks
- `Path=/`: Available for entire application

## Migration from Old Implementation

### ❌ Old Way (localStorage)
```javascript
// Insecure - vulnerable to XSS
const token = localStorage.getItem('token');
config.headers.Authorization = `Bearer ${token}`;
```

### ✅ New Way (HTTP-Only Cookies)
```javascript
// Secure - cookies handled automatically
// No manual token management needed!
const response = await api.get('/endpoint');
```

## Development vs Production

### Development (MSW Mocks)
- Mock handlers simulate cookie behavior
- Cookies are stored in browser (visible in DevTools)
- Full authentication flow works as in production

### Production
- Backend must implement cookie-based endpoints
- Ensure HTTPS is enabled for Secure cookies
- Configure CORS to allow credentials

## Troubleshooting

### Issue: User not authenticated after login
**Solution**: Check that cookies are being set in Network tab

### Issue: 401 errors on protected routes
**Solution**: Verify `/api/verify` endpoint returns user data

### Issue: Token refresh not working
**Solution**: Check that refresh token cookie exists and hasn't expired

### Issue: Cookies not being sent with requests
**Solution**: Ensure `withCredentials: true` is set in axios config

## Testing Authentication

### Manual Testing
1. Open DevTools → Network tab
2. Login with demo credentials
3. Check Response headers for `Set-Cookie`
4. Navigate to protected route
5. Verify cookies are sent in Request headers

### Testing Token Refresh
1. Login to the application
2. Wait 15 minutes (or modify token expiry)
3. Make a request to any protected endpoint
4. Check Network tab - you should see:
   - Original request (401)
   - Refresh request (200)
   - Retry of original request (200)

## Best Practices

1. **Never store tokens in localStorage** - Use HTTP-only cookies
2. **Keep access tokens short-lived** - Minimize damage if compromised
3. **Use refresh tokens wisely** - Longer expiration for better UX
4. **Always use HTTPS in production** - Secure cookie flag requires it
5. **Implement token rotation** - New refresh token on each refresh

## Production Checklist

- [ ] HTTPS enabled and enforced
- [ ] Secure cookie flag enabled
- [ ] CORS configured to allow credentials
- [ ] Rate limiting on login endpoint
- [ ] Token revocation implemented
- [ ] Refresh token rotation enabled
- [ ] Session timeout handling
- [ ] Security headers configured
- [ ] CSP policy includes authentication endpoints

## Additional Resources

- See `SECURITY.md` for detailed security implementation
- Check `src/services/api.js` for axios interceptor configuration
- Review `src/mocks/handlers.js` for mock implementation examples

## Support

For questions or issues with authentication:
1. Check browser console for errors
2. Verify cookies in DevTools
3. Check Network tab for request/response details
4. Review this guide and SECURITY.md
