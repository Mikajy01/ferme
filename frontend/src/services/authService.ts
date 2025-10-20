import { notificationService } from './notificationService';
export interface LoginCredentials {
  session: string;
  password: string;
}

export interface User {
  idUser: string;
  session: string;
  name: string;
  firstName: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// URL de base de l'API depuis .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Service d'authentification
export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Échec de la connexion. Vérifiez vos identifiants.');
      }

      const data = await response.json();
      notificationService.success('Connexion réussie !');
      return data;

    } catch (error) {
      notificationService.error('Erreur de connexion. Vérifiez vos identifiants.');
      throw error;
    }
  },


  // Méthode pour stocker les données d'authentification
  storeAuthData(token: string, user: User): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Méthode pour récupérer le token
  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  // Méthode pour récupérer l'utilisateur
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Méthode pour vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Méthode pour se déconnecter
   logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    notificationService.info('Vous avez été déconnecté avec succès.');
  },

};