const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/dev';

// Auth APIs
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  verifyToken: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Token verification failed');
    }
    
    return response.json();
  },
};

// Admin APIs
export const adminAPI = {
  // Get list of all admins
  getAdminsList: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/admins-list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admins list');
    }
    
    return response.json();
  },

  // Create new admin
  createAdmin: async (token: string, adminData: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
    paymentStatus?: string;
    duration: number;
    amount: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(adminData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create admin');
    }
    
    return response.json();
  },

  // Get admin details by ID
  getAdminDetails: async (token: string, adminId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin-details/${adminId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin details');
    }
    
    return response.json();
  },

  // Update payment status
  updatePaymentStatus: async (token: string, adminId: string, isPaid: boolean) => {
    const response = await fetch(`${API_BASE_URL}/update-payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ adminId, isPaid }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }
    
    return response.json();
  },

  // Delete admin
  deleteAdmin: async (token: string, adminId: string) => {
    const response = await fetch(`${API_BASE_URL}/delete-admin/${adminId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete admin');
    }
    
    return response.json();
  },
};

// Report APIs
export const reportAPI = {
  // Get report data
  getReport: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/report`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch report');
    }
    
    return response.json();
  },

  // Get monthly revenue
  getMonthRevenue: async (token: string, month: number) => {
    const response = await fetch(`${API_BASE_URL}/month-revenue?month=${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch monthly revenue');
    }
    
    return response.json();
  },

  // Get yearly revenue graph
  getYearlyRevenueGraph: async (token: string, year: number) => {
    const response = await fetch(`${API_BASE_URL}/yearly-revenue-graph?year=${year}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch yearly revenue graph');
    }
    
    return response.json();
  },
};

export default {
  auth: authAPI,
  admin: adminAPI,
  report: reportAPI,
};
