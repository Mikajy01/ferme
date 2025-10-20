import { authService } from './authService';

export interface PurchaseItem {
  id: number;
  purchaseId: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  product?: Product;
  batch?: Batch;
}

export interface Batch {
  id: number;
  productId: number;
  purchaseItemId: number;
  quantity: string;
  remaining: string;
  unitPrice: string;
  receivedAt: string;
  expiryDate: string | null;
  createdAt: string;
}

export interface FinancialTransaction {
  id: number;
  type: 'EXPENSE' | 'INCOME';
  amount: string;
  date: string;
  note: string;
  purchaseId: number | null;
  saleId: number | null;
  productionId: number | null;
}

export interface Purchase {
  id: number;
  supplier: string;
  date: string;
  totalAmount: string;
  createdAt: string;
  items: PurchaseItem[];
  financialTransaction?: FinancialTransaction;
}

export interface CreatePurchaseDto {
  supplier: string;
  date: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
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

export const purchaseService = {
  // Lister tous les achats
  getAll: async (): Promise<Purchase[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/purchases`);
    return await response.json();
  },

  // Récupérer un achat par ID
  getById: async (id: number): Promise<Purchase> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/purchases/${id}`);
    return await response.json();
  },

  // Créer un achat
  create: async (data: CreatePurchaseDto): Promise<Purchase> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText || 'Erreur lors de la création'}`);
      
    } catch (error) {
      console.error('❌ Erreur création achat:', error);
      throw error;
    }
  },

  // Supprimer un achat
  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/purchases/${id}`, {
      method: 'DELETE',
    });
  }
};