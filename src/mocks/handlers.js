import { http, HttpResponse } from 'msw';

// Mock users database
const mockUsers = {
  'root@flowdesk.com': {
    password: 'password',
    user: {
      id: 1,
      name: 'Alice Root',
      email: 'root@flowdesk.com',
      role: 'root_admin',
    },
  },
  'admin@client.com': {
    password: 'password',
    user: {
      id: 2,
      name: 'Bob Admin',
      email: 'admin@client.com',
      role: 'client_admin',
    },
  },
  'user@client.com': {
    password: 'password',
    user: {
      id: 3,
      name: 'Charlie User',
      email: 'user@client.com',
      role: 'client_user',
    },
  },
};

export const handlers = [
  // Login endpoint
  http.post('/api/login', async ({ request }) => {
    const { email, password } = await request.json();

    const userRecord = mockUsers[email];

    if (!userRecord || userRecord.password !== password) {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      token: 'mock-token-123',
      user: userRecord.user,
    });
  }),

  // Dashboard stats endpoint
  http.get('/api/dashboard/stats', () => {
    return HttpResponse.json({
      totalUsers: 1523,
      activeClients: 45,
      revenue: 125430,
      growth: 12.5,
    });
  }),

  // Analytics data endpoint
  http.get('/api/analytics', () => {
    return HttpResponse.json({
      data: [
        { name: 'Jan', users: 400, revenue: 2400 },
        { name: 'Feb', users: 300, revenue: 1398 },
        { name: 'Mar', users: 600, revenue: 9800 },
        { name: 'Apr', users: 800, revenue: 3908 },
        { name: 'May', users: 1000, revenue: 4800 },
        { name: 'Jun', users: 1200, revenue: 3800 },
      ],
    });
  }),

  // Users list endpoint
  http.get('/api/users', () => {
    return HttpResponse.json({
      users: [
        { id: 1, name: 'Alice Root', email: 'root@flowdesk.com', role: 'root_admin', status: 'active' },
        { id: 2, name: 'Bob Admin', email: 'admin@client.com', role: 'client_admin', status: 'active' },
        { id: 3, name: 'Charlie User', email: 'user@client.com', role: 'client_user', status: 'active' },
        { id: 4, name: 'Dave Smith', email: 'dave@client.com', role: 'client_user', status: 'inactive' },
      ],
    });
  }),
];
