const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/super-admin/v1';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Auth APIs
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    return response.json();
  },

  verifyToken: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
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
  getAdminsList: async () => {
    const response = await fetch(`${API_BASE_URL}/admins-list`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admins list');
    }
    
    return response.json();
  },

  // Create new admin
  createAdmin: async (adminData: {
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
      headers: getAuthHeaders(),
      body: JSON.stringify(adminData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create admin');
    }
    
    return response.json();
  },

  // Get admin details by ID
  getAdminDetails: async (adminId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin-details/${adminId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch admin details');
    }
    
    return response.json();
  },

  // Update payment status
  updatePaymentStatus: async (adminId: string, isPaid: boolean) => {
    const response = await fetch(`${API_BASE_URL}/update-payment-status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adminId, isPaid }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }
    
    return response.json();
  },

  // Delete admin
  deleteAdmin: async (adminId: string) => {
    const response = await fetch(`${API_BASE_URL}/delete-admin/${adminId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
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
  getReport: async () => {
    const response = await fetch(`${API_BASE_URL}/report`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch report');
    }
    
    return response.json();
  },

  // Get monthly revenue
  getMonthRevenue: async (month: number) => {
    const response = await fetch(`${API_BASE_URL}/month-revenue?month=${month}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch monthly revenue');
    }
    
    return response.json();
  },

  // Get yearly revenue graph
  getYearlyRevenueGraph: async (year: number) => {
    const response = await fetch(`${API_BASE_URL}/yearly-revenue-graph?year=${year}`, {
      method: 'GET',
      headers: getAuthHeaders(),
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
