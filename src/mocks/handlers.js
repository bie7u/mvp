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

// Mock clients database
let mockClients = [
  {
    id: 1,
    name: 'Acme Corporation',
    adminName: 'Bob Admin',
    adminEmail: 'admin@client.com',
    status: 'active',
  },
];

let nextClientId = 2;

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
        { id: 1, name: 'Alice Root', email: 'root@flowdesk.com', role: 'root_admin', status: 'active', clientId: null, clientName: null },
        { id: 2, name: 'Bob Admin', email: 'admin@client.com', role: 'client_admin', status: 'active', clientId: 1, clientName: 'Acme Corporation' },
        { id: 3, name: 'Charlie User', email: 'user@client.com', role: 'client_user', status: 'active', clientId: 1, clientName: 'Acme Corporation' },
        { id: 4, name: 'Dave Smith', email: 'dave@client.com', role: 'client_user', status: 'inactive', clientId: 1, clientName: 'Acme Corporation' },
      ],
    });
  }),

  // Get clients endpoint
  http.get('/api/clients', () => {
    return HttpResponse.json({
      clients: mockClients,
    });
  }),

  // Create client endpoint
  http.post('/api/clients', async ({ request }) => {
    const { clientName, adminName, adminEmail, adminPassword } = await request.json();

    const newClient = {
      id: nextClientId++,
      name: clientName,
      adminName,
      adminEmail,
      status: 'active',
    };

    // Add client admin to mock users
    mockUsers[adminEmail] = {
      password: adminPassword,
      user: {
        id: nextClientId + 100,
        name: adminName,
        email: adminEmail,
        role: 'client_admin',
      },
    };

    mockClients.push(newClient);

    return HttpResponse.json({
      client: newClient,
      message: 'Client created successfully',
    });
  }),

  // Update user's client assignment
  http.patch('/api/users/:userId/client', async ({ request, params }) => {
    const { clientId } = await request.json();
    const { userId } = params;

    return HttpResponse.json({
      message: 'User client updated successfully',
      userId,
      clientId,
    });
  }),
];
