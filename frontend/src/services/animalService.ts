/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService } from './authService';

export interface Animal {
  id: number;
  tag: string;
  species: string;
  birthDate: string;
  buyPrice: string;
  status: 'active' | 'sold' | 'deceased';
  events?: AnimalEvent[];
  totalExpenses?: number;
}

export interface AnimalEvent {
  id: number;
  animalId: number;
  type: 'feed' | 'vaccination' | 'health' | 'other';
  date: string;
  note: string;
  cost: string;
  animal?: Animal;
}

export interface CreateAnimalDto {
  tag: string;
  species: string;
  birthDate: string;
  buyPrice: number;
  status: 'active' | 'sold' | 'deceased';
}

export interface CreateAnimalEventDto {
  animalId: number;
  type: 'feed' | 'vaccination' | 'health' | 'other' | 'sale';
  date: string;
  note: string;
  cost: number;
}

export interface FeedAnimalsDto {
  batchId: number;
  quantity: number;
  animals: number[];
  date: string;
}

export interface Batch {
  id: number;
  productId: number;
  purchaseItemId: number | null;
  quantity: string;
  remaining: string;
  unitPrice: string;
  receivedAt: string;
  expiryDate: string | null;
  createdAt: string;
  product?: Product;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitId: number;
  isSellable: boolean;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
}

export interface Unit {
  id: number;
  code: string;
  name: string;
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
      'accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    
    if (response.status === 401) {
      authService.logout();
      window.location.href = '/';
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    
    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur serveur'}`);
    
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
    }
    throw error;
  }
};

export const animalService = {
  // Lister tous les animaux
  getAll: async (status?: string): Promise<Animal[]> => {
    const url = status ? `${API_BASE_URL}/animals?status=${status}` : `${API_BASE_URL}/animals`;
    const response = await fetchWithAuth(url);
    return await response.json();
  },

  // Récupérer un animal par ID
  getById: async (id: number): Promise<Animal> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/animals/${id}`);
    return await response.json();
  },

  // Créer un animal
  create: async (data: CreateAnimalDto): Promise<Animal> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/animals`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors de la création'}`);
      
    } catch (error) {
      console.error('❌ Erreur création animal:', error);
      throw error;
    }
  },

  // Mettre à jour un animal
  update: async (id: number, data: Partial<CreateAnimalDto>): Promise<Animal> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/animals/${id}`, {
      method: 'PATCH', // Changé de PUT à PATCH
      body: JSON.stringify(data)
    });

    return await response.json();
    
  } catch (error) {
    console.error('❌ Erreur mise à jour animal:', error);
    throw error;
  }
},

  // Nourrir des animaux
  feed: async (data: FeedAnimalsDto): Promise<any> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/animals/feed`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors du nourrissage'}`);
      
    } catch (error) {
      console.error('❌ Erreur nourrissage animaux:', error);
      throw error;
    }
  },

  // Créer un événement pour un animal
  createEvent: async (data: CreateAnimalEventDto): Promise<AnimalEvent> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/animals/events`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors de la création de l\'événement'}`);
      
    } catch (error) {
      console.error('❌ Erreur création événement:', error);
      throw error;
    }
  },

  // Récupérer les événements d'un animal
  getEvents: async (animalId: number): Promise<AnimalEvent[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/animals/events?animalId=${animalId}`);
    return await response.json();
  },

  // Récupérer tous les lots disponibles
  getBatches: async (): Promise<Batch[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/batches`);
    return await response.json();
  }
};