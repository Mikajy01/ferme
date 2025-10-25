import { authService } from './authService';

export interface ApiUser {
  idUser: string;
  session: string;
  name: string;
  firstName?: string;
  isActive: boolean;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  session: string;
  name: string;
  firstName: string;
  role: string;
  isActive: boolean;
}

export interface UpdateUserStatusData {
  isActive: boolean;
}

export interface UsersResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: ApiUser[];
}

export interface UsersFilters {
  role?: string[];
  isActive?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  gestionnaireUsers: number;
  employeUsers: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fonction utilitaire pour les requêtes
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = authService.getToken();
  
  if (!token) {
    throw new Error('Token d\'authentification manquant');
  }

  const config: RequestInit = {
    ...options,
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${token}`,
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        window.location.href = '/';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      if (response.status === 404) {
        throw new Error('Ressource non trouvée');
      }
      
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur serveur'}`);
    }

    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    }
    throw error;
  }
};

export const userService = {
  async getUsers(filters: UsersFilters = {}): Promise<UsersResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.role && filters.role.length > 0) {
      filters.role.forEach(role => queryParams.append('role', role));
    }
    
    if (filters.isActive !== undefined) {
      queryParams.append('isActive', filters.isActive);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    
    if (filters.limit) {
      queryParams.append('limit', filters.limit.toString());
    }

    ;
    
    const response = await fetchWithAuth(`${API_BASE_URL}/users?${queryParams.toString()}`);
    const data = await response.json();
    ;
    return data;
  },

  async createUser(userData: CreateUserData): Promise<ApiUser> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return await response.json();
  },

  async updateUserStatus(session: string, statusData: UpdateUserStatusData): Promise<ApiUser> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/status/${session}`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    });
    return await response.json();
  },

  async updateUser(userId: string, userData: Partial<CreateUserData>): Promise<ApiUser> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    return await response.json();
  },

  async deleteUser(userId: string): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetchWithAuth(`${API_BASE_URL}/users/dashboard/stats`);
    return await response.json();
  }
};