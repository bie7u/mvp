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

  // Users list endpoint with server-side filtering
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const searchParam = url.searchParams.get('search');
    
    let users = [
      { id: 1, name: 'Alice Root', email: 'root@flowdesk.com', role: 'root_admin', status: 'active', clientId: null, clientName: null },
      { id: 2, name: 'Bob Admin', email: 'admin@client.com', role: 'client_admin', status: 'active', clientId: 1, clientName: 'Acme Corporation' },
      { id: 3, name: 'Charlie User', email: 'user@client.com', role: 'client_user', status: 'active', clientId: 1, clientName: 'Acme Corporation' },
      { id: 4, name: 'Dave Smith', email: 'dave@client.com', role: 'client_user', status: 'inactive', clientId: 1, clientName: 'Acme Corporation' },
    ];
    
    // Server-side search filtering
    if (searchParam) {
      const search = searchParam.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    }
    
    return HttpResponse.json({
      users,
    });
  }),

  // Get clients endpoint
  http.get('/api/clients', () => {
    return HttpResponse.json({
      clients: mockClients,
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

  // Get client users endpoint
  http.get('/api/clients/:clientId/users', ({ params }) => {
    const { clientId } = params;
    
    // Mock users for the client
    const clientUsers = [
      { id: 2, name: 'Bob Admin', email: 'admin@client.com', role: 'client_admin', status: 'active', clientId: parseInt(clientId), clientName: 'Acme Corporation' },
      { id: 3, name: 'Charlie User', email: 'user@client.com', role: 'client_user', status: 'active', clientId: parseInt(clientId), clientName: 'Acme Corporation' },
      { id: 4, name: 'Dave Smith', email: 'dave@client.com', role: 'client_user', status: 'inactive', clientId: parseInt(clientId), clientName: 'Acme Corporation' },
    ];

    return HttpResponse.json({
      users: clientUsers.filter(u => u.clientId === parseInt(clientId)),
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
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    
    let matches = mockMatches;
    
    // Server-side date filtering
    if (startDateParam || endDateParam) {
      matches = matches.filter(match => {
        const matchDate = new Date(match.date);
        matchDate.setHours(0, 0, 0, 0);
        
        if (startDateParam) {
          const startDate = new Date(startDateParam);
          startDate.setHours(0, 0, 0, 0);
          if (matchDate < startDate) return false;
        }
        
        if (endDateParam) {
          const endDate = new Date(endDateParam);
          endDate.setHours(0, 0, 0, 0);
          if (matchDate > endDate) return false;
        }
        
        return true;
      });
    }
    
    // Server-side league filtering
    if (leagueParam) {
      matches = matches.filter(match => match.league === leagueParam);
    }
    
    return HttpResponse.json({
      matches,
    });
  }),

  // Get user's predictions
  // Get user's predictions
  http.get('/api/predictions/user', () => {
    // In a real app, we'd get the user from the auth token
    // For now, we'll return all predictions
    // and filter on the frontend if needed
    return HttpResponse.json({
      predictions: mockPredictions,
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

  // Get rankings
  http.get('/api/rankings', ({ request }) => {
    const url = new URL(request.url);
    const clientIdParam = url.searchParams.get('clientId');
    
    // If clientId is provided, use it; otherwise default to client 1
    const clientId = clientIdParam ? parseInt(clientIdParam) : 1;
    
    const rankings = calculateClientRankings(clientId);

    return HttpResponse.json({
      rankings,
    });
  }),
];
