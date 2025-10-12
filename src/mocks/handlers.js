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
  {
    id: 2,
    name: 'TechStart Inc',
    adminName: 'Jane Smith',
    adminEmail: 'jane@techstart.com',
    status: 'active',
  },
];

let nextClientId = 3;

// Mock predictions database
let mockPredictions = [
  // Client 1 users predictions
  { id: 1, userId: 2, userName: 'Bob Admin', email: 'admin@client.com', clientId: 1, matchId: 1, homeScore: 2, awayScore: 1 },
  { id: 2, userId: 2, userName: 'Bob Admin', email: 'admin@client.com', clientId: 1, matchId: 2, homeScore: 1, awayScore: 1 },
  { id: 3, userId: 3, userName: 'Charlie User', email: 'user@client.com', clientId: 1, matchId: 1, homeScore: 3, awayScore: 1 },
  { id: 4, userId: 3, userName: 'Charlie User', email: 'user@client.com', clientId: 1, matchId: 2, homeScore: 0, awayScore: 2 },
  // Client 2 users predictions
  { id: 5, userId: 5, userName: 'Jane Smith', email: 'jane@techstart.com', clientId: 2, matchId: 1, homeScore: 1, awayScore: 2 },
  { id: 6, userId: 5, userName: 'Jane Smith', email: 'jane@techstart.com', clientId: 2, matchId: 2, homeScore: 2, awayScore: 1 },
  { id: 7, userId: 6, userName: 'Mark Johnson', email: 'mark@techstart.com', clientId: 2, matchId: 1, homeScore: 2, awayScore: 0 },
];

let nextPredictionId = 8;

// Mock matches database
const mockMatches = [
  {
    id: 1,
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    date: '2025-10-13',
    time: '15:00',
    league: 'Premier League',
    locked: false,
  },
  {
    id: 2,
    homeTeam: 'Liverpool',
    awayTeam: 'Chelsea',
    date: '2025-10-14',
    time: '17:30',
    league: 'Premier League',
    locked: false,
  },
  {
    id: 3,
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    date: '2025-10-15',
    time: '20:00',
    league: 'La Liga',
    locked: false,
  },
  {
    id: 4,
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    date: '2025-10-16',
    time: '18:30',
    league: 'Bundesliga',
    locked: false,
  },
  {
    id: 5,
    homeTeam: 'Inter Milan',
    awayTeam: 'AC Milan',
    date: '2025-10-17',
    time: '19:45',
    league: 'Serie A',
    locked: false,
  },
  {
    id: 6,
    homeTeam: 'Tottenham',
    awayTeam: 'Manchester United',
    date: '2025-10-18',
    time: '16:00',
    league: 'Premier League',
    locked: false,
  },
  {
    id: 7,
    homeTeam: 'Atletico Madrid',
    awayTeam: 'Sevilla',
    date: '2025-10-20',
    time: '21:00',
    league: 'La Liga',
    locked: false,
  },
  {
    id: 8,
    homeTeam: 'PSG',
    awayTeam: 'Marseille',
    date: '2025-10-25',
    time: '20:00',
    league: 'Ligue 1',
    locked: false,
  },
];

// Helper function to calculate points
const calculatePoints = (prediction, match) => {
  if (match.actualHomeScore === undefined || match.actualAwayScore === undefined) {
    return 0;
  }

  const predictedHomeScore = prediction.homeScore;
  const predictedAwayScore = prediction.awayScore;
  const actualHomeScore = match.actualHomeScore;
  const actualAwayScore = match.actualAwayScore;

  // Correct result (exact score) = 3 points
  if (predictedHomeScore === actualHomeScore && predictedAwayScore === actualAwayScore) {
    return 3;
  }

  // Correct winner = 1 point
  const predictedWinner = predictedHomeScore > predictedAwayScore ? 'home' : 
                         predictedHomeScore < predictedAwayScore ? 'away' : 'draw';
  const actualWinner = actualHomeScore > actualAwayScore ? 'home' : 
                      actualHomeScore < actualAwayScore ? 'away' : 'draw';

  if (predictedWinner === actualWinner) {
    return 1;
  }

  return 0;
};

// Helper function to calculate user rankings for a client
const calculateClientRankings = (clientId) => {
  // Get all users in this client
  const clientUsersMap = {
    1: [
      { id: 2, name: 'Bob Admin', email: 'admin@client.com', clientId: 1 },
      { id: 3, name: 'Charlie User', email: 'user@client.com', clientId: 1 },
      { id: 4, name: 'Dave Smith', email: 'dave@client.com', clientId: 1 },
    ],
    2: [
      { id: 5, name: 'Jane Smith', email: 'jane@techstart.com', clientId: 2 },
      { id: 6, name: 'Mark Johnson', email: 'mark@techstart.com', clientId: 2 },
    ],
  };

  const clientUsers = clientUsersMap[clientId] || [];

  // Calculate points for each user
  const userStats = clientUsers.map(user => {
    const userPredictions = mockPredictions.filter(p => p.userId === user.id);
    let totalPoints = 0;
    let correctResults = 0;
    let correctWinners = 0;

    userPredictions.forEach(prediction => {
      const match = mockMatches.find(m => m.id === prediction.matchId);
      if (match && match.locked && match.actualHomeScore !== undefined) {
        const points = calculatePoints(prediction, match);
        totalPoints += points;
        
        if (points === 3) {
          correctResults++;
          correctWinners++; // Correct result also means correct winner
        } else if (points === 1) {
          correctWinners++;
        }
      }
    });

    return {
      userId: user.id,
      userName: user.name,
      email: user.email,
      points: totalPoints,
      correctResults,
      correctWinners,
      totalPredictions: userPredictions.length,
    };
  });

  // Sort by points (descending), then by correct results
  userStats.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.correctResults - a.correctResults;
  });

  // Add position
  return userStats.map((stat, index) => ({
    ...stat,
    position: index + 1,
  }));
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

  // Analytics data endpoint with server-side filtering
  http.get('/api/analytics', ({ request }) => {
    const url = new URL(request.url);
    const clientIdParam = url.searchParams.get('clientId');
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    // Mock analytics data
    let analyticsData = [
      { name: 'Jan', users: 400, revenue: 2400, date: '2025-01-01' },
      { name: 'Feb', users: 300, revenue: 1398, date: '2025-02-01' },
      { name: 'Mar', users: 600, revenue: 9800, date: '2025-03-01' },
      { name: 'Apr', users: 800, revenue: 3908, date: '2025-04-01' },
      { name: 'May', users: 1000, revenue: 4800, date: '2025-05-01' },
      { name: 'Jun', users: 1200, revenue: 3800, date: '2025-06-01' },
    ];

    // Filter by date range if provided
    if (startDateParam) {
      analyticsData = analyticsData.filter(d => d.date >= startDateParam);
    }

    if (endDateParam) {
      analyticsData = analyticsData.filter(d => d.date <= endDateParam);
    }

    // In a real implementation, clientId would filter the data by client
    // For now, we'll just acknowledge the parameter
    if (clientIdParam) {
      // Would filter by client in real implementation
    }

    // Remove the date field from response (internal use only)
    const responseData = analyticsData.map(({ date: _date, ...rest }) => rest);

    return HttpResponse.json({
      data: responseData,
    });
  }),

  // Users list endpoint with server-side filtering
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const clientIdParam = url.searchParams.get('clientId');
    const roleParam = url.searchParams.get('role');
    const statusParam = url.searchParams.get('status');
    const searchParam = url.searchParams.get('search');
    const pageParam = parseInt(url.searchParams.get('page')) || 1;
    const limitParam = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);

    // All users in the system
    let allUsers = [
      { id: 1, name: 'Alice Root', email: 'root@flowdesk.com', role: 'root_admin', status: 'active', clientId: null, clientName: null },
      { id: 2, name: 'Bob Admin', email: 'admin@client.com', role: 'client_admin', status: 'active', clientId: 1, clientName: 'Acme Corporation' },
      { id: 3, name: 'Charlie User', email: 'user@client.com', role: 'client_user', status: 'active', clientId: 1, clientName: 'Acme Corporation' },
      { id: 4, name: 'Dave Smith', email: 'dave@client.com', role: 'client_user', status: 'inactive', clientId: 1, clientName: 'Acme Corporation' },
      { id: 5, name: 'Jane Smith', email: 'jane@techstart.com', role: 'client_admin', status: 'active', clientId: 2, clientName: 'TechStart Inc' },
      { id: 6, name: 'Mark Johnson', email: 'mark@techstart.com', role: 'client_user', status: 'active', clientId: 2, clientName: 'TechStart Inc' },
    ];

    // Apply filters
    let filteredUsers = allUsers;

    // Filter by client ID
    if (clientIdParam) {
      filteredUsers = filteredUsers.filter(u => u.clientId === parseInt(clientIdParam));
    }

    // Filter by role
    if (roleParam) {
      filteredUsers = filteredUsers.filter(u => u.role === roleParam);
    }

    // Filter by status
    if (statusParam) {
      filteredUsers = filteredUsers.filter(u => u.status === statusParam);
    }

    // Search by name or email
    if (searchParam) {
      const search = searchParam.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    // Apply pagination
    const startIndex = (pageParam - 1) * limitParam;
    const endIndex = startIndex + limitParam;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      users: paginatedUsers,
      pagination: {
        page: pageParam,
        limit: limitParam,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limitParam),
      },
    });
  }),

  // Get clients endpoint with server-side filtering
  http.get('/api/clients', ({ request }) => {
    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status');
    const searchParam = url.searchParams.get('search');
    const pageParam = parseInt(url.searchParams.get('page')) || 1;
    const limitParam = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);

    let filteredClients = mockClients;

    // Filter by status
    if (statusParam) {
      filteredClients = filteredClients.filter(c => c.status === statusParam);
    }

    // Search by client name or admin email
    if (searchParam) {
      const search = searchParam.toLowerCase();
      filteredClients = filteredClients.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.adminEmail.toLowerCase().includes(search)
      );
    }

    // Apply pagination
    const startIndex = (pageParam - 1) * limitParam;
    const endIndex = startIndex + limitParam;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    return HttpResponse.json({
      clients: paginatedClients,
      pagination: {
        page: pageParam,
        limit: limitParam,
        total: filteredClients.length,
        totalPages: Math.ceil(filteredClients.length / limitParam),
      },
    });
  }),

  // Get client by ID endpoint
  http.get('/api/clients/:clientId', ({ params }) => {
    const { clientId } = params;
    const client = mockClients.find(c => c.id === parseInt(clientId));
    
    if (!client) {
      return HttpResponse.json(
        { message: 'Client not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      client,
    });
  }),

  // Get client users endpoint with server-side filtering
  http.get('/api/clients/:clientId/users', ({ params, request }) => {
    const { clientId } = params;
    const url = new URL(request.url);
    const roleParam = url.searchParams.get('role');
    const statusParam = url.searchParams.get('status');
    const pageParam = parseInt(url.searchParams.get('page')) || 1;
    const limitParam = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);
    
    // Mock users for the client
    const allClientUsers = [
      { id: 2, name: 'Bob Admin', email: 'admin@client.com', role: 'client_admin', status: 'active', clientId: 1, clientName: 'Acme Corporation' },
      { id: 3, name: 'Charlie User', email: 'user@client.com', role: 'client_user', status: 'active', clientId: 1, clientName: 'Acme Corporation' },
      { id: 4, name: 'Dave Smith', email: 'dave@client.com', role: 'client_user', status: 'inactive', clientId: 1, clientName: 'Acme Corporation' },
      { id: 5, name: 'Jane Smith', email: 'jane@techstart.com', role: 'client_admin', status: 'active', clientId: 2, clientName: 'TechStart Inc' },
      { id: 6, name: 'Mark Johnson', email: 'mark@techstart.com', role: 'client_user', status: 'active', clientId: 2, clientName: 'TechStart Inc' },
    ];

    // Filter by client ID
    let filteredUsers = allClientUsers.filter(u => u.clientId === parseInt(clientId));

    // Filter by role
    if (roleParam) {
      filteredUsers = filteredUsers.filter(u => u.role === roleParam);
    }

    // Filter by status
    if (statusParam) {
      filteredUsers = filteredUsers.filter(u => u.status === statusParam);
    }

    // Apply pagination
    const startIndex = (pageParam - 1) * limitParam;
    const endIndex = startIndex + limitParam;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    return HttpResponse.json({
      users: paginatedUsers,
      pagination: {
        page: pageParam,
        limit: limitParam,
        total: filteredUsers.length,
        totalPages: Math.ceil(filteredUsers.length / limitParam),
      },
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

  // Delete user endpoint
  http.delete('/api/users/:userId', ({ params }) => {
    const { userId } = params;

    return HttpResponse.json({
      message: 'User deleted successfully',
      userId,
    });
  }),

  // Get upcoming matches for predictions with server-side filtering
  http.get('/api/predictions/matches', ({ request }) => {
    const url = new URL(request.url);
    const leagueParam = url.searchParams.get('league');
    const dateParam = url.searchParams.get('date');
    const lockedParam = url.searchParams.get('locked');
    const pageParam = parseInt(url.searchParams.get('page')) || 1;
    const limitParam = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);

    let filteredMatches = mockMatches;

    // Filter by league
    if (leagueParam) {
      filteredMatches = filteredMatches.filter(m => m.league === leagueParam);
    }

    // Filter by date
    if (dateParam) {
      filteredMatches = filteredMatches.filter(m => m.date === dateParam);
    }

    // Filter by locked status
    if (lockedParam !== null && lockedParam !== undefined) {
      const isLocked = lockedParam === 'true';
      filteredMatches = filteredMatches.filter(m => m.locked === isLocked);
    }

    // Apply pagination
    const startIndex = (pageParam - 1) * limitParam;
    const endIndex = startIndex + limitParam;
    const paginatedMatches = filteredMatches.slice(startIndex, endIndex);

    return HttpResponse.json({
      matches: paginatedMatches,
      pagination: {
        page: pageParam,
        limit: limitParam,
        total: filteredMatches.length,
        totalPages: Math.ceil(filteredMatches.length / limitParam),
      },
    });
  }),

  // Get user's predictions with server-side filtering
  http.get('/api/predictions/user', ({ request }) => {
    const url = new URL(request.url);
    const matchIdParam = url.searchParams.get('matchId');
    const statusParam = url.searchParams.get('status');
    const pageParam = parseInt(url.searchParams.get('page')) || 1;
    const limitParam = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);

    // In a real app, we'd get the user from the auth token
    // For now, we'll return all predictions and filter based on query params
    let filteredPredictions = mockPredictions;

    // Filter by match ID
    if (matchIdParam) {
      filteredPredictions = filteredPredictions.filter(p => p.matchId === parseInt(matchIdParam));
    }

    // Filter by status (based on match status)
    if (statusParam) {
      filteredPredictions = filteredPredictions.filter(p => {
        const match = mockMatches.find(m => m.id === p.matchId);
        if (!match) return false;

        if (statusParam === 'upcoming') {
          return !match.locked && match.actualHomeScore === undefined;
        } else if (statusParam === 'locked') {
          return match.locked && match.actualHomeScore === undefined;
        } else if (statusParam === 'completed') {
          return match.actualHomeScore !== undefined;
        }
        return true;
      });
    }

    // Apply pagination
    const startIndex = (pageParam - 1) * limitParam;
    const endIndex = startIndex + limitParam;
    const paginatedPredictions = filteredPredictions.slice(startIndex, endIndex);

    return HttpResponse.json({
      predictions: paginatedPredictions,
      pagination: {
        page: pageParam,
        limit: limitParam,
        total: filteredPredictions.length,
        totalPages: Math.ceil(filteredPredictions.length / limitParam),
      },
    });
  }),

  // Create a prediction
  http.post('/api/predictions', async ({ request }) => {
    const { matchId, homeScore, awayScore } = await request.json();
    
    // Mock: assume user from token (in real app)
    // For demo, we'll use client_user (id: 3)
    const newPrediction = {
      id: nextPredictionId++,
      userId: 3, // This would come from auth token in real app
      userName: 'Charlie User',
      email: 'user@client.com',
      clientId: 1,
      matchId,
      homeScore,
      awayScore,
    };

    mockPredictions.push(newPrediction);

    return HttpResponse.json({
      prediction: newPrediction,
      message: 'Prediction created successfully',
    });
  }),

  // Update a prediction
  http.put('/api/predictions/:predictionId', async ({ request, params }) => {
    const { predictionId } = params;
    const { homeScore, awayScore } = await request.json();

    const predictionIndex = mockPredictions.findIndex(p => p.id === parseInt(predictionId));
    
    if (predictionIndex === -1) {
      return HttpResponse.json(
        { message: 'Prediction not found' },
        { status: 404 }
      );
    }

    mockPredictions[predictionIndex] = {
      ...mockPredictions[predictionIndex],
      homeScore,
      awayScore,
    };

    return HttpResponse.json({
      prediction: mockPredictions[predictionIndex],
      message: 'Prediction updated successfully',
    });
  }),

  // Get rankings with server-side filtering and pagination
  http.get('/api/rankings', ({ request }) => {
    const url = new URL(request.url);
    const clientIdParam = url.searchParams.get('clientId');
    const pageParam = parseInt(url.searchParams.get('page')) || 1;
    const limitParam = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);
    
    // If clientId is provided, use it; otherwise default to client 1
    const clientId = clientIdParam ? parseInt(clientIdParam) : 1;
    
    const allRankings = calculateClientRankings(clientId);

    // Apply pagination
    const startIndex = (pageParam - 1) * limitParam;
    const endIndex = startIndex + limitParam;
    const paginatedRankings = allRankings.slice(startIndex, endIndex);

    return HttpResponse.json({
      rankings: paginatedRankings,
      pagination: {
        page: pageParam,
        limit: limitParam,
        total: allRankings.length,
        totalPages: Math.ceil(allRankings.length / limitParam),
      },
    });
  }),
];
