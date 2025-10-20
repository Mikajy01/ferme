/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService } from './authService';

export interface Culture {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  area: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  events?: CultureEvent[];
  harvests?: Harvest[];
  totalExpenses?: number;
  totalHarvested?: number;
}

export interface CultureEvent {
  id: number;
  cultureId: number;
  type: string;
  date: string;
  description: string;
  cost: string;
  culture?: Culture;
}

export interface Harvest {
  id: number;
  cultureId: number;
  productId: number;
  quantity: string;
  date: string;
  note: string;
  culture?: Culture;
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
}

export interface Batch {
  [x: string]: any;
  id: number;
  productId: number;
  purchaseItemId: number | null;
  quantity: string;
  remaining: string;
  unitPrice: string;
  receivedAt: string;
  expiryDate: string | null;
  createdAt: string;
}

export interface CreateCultureDto {
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  area: number;
  note: string;
}

export interface CreateCultureEventDto {
  cultureId: number;
  type: string;
  date: string;
  description: string;
  cost: number;
}

export interface CreateHarvestDto {
  cultureId: number;
  productId: number;
  quantity: number;
  date: string;
  note: string;
}

export interface SeedCultureDto {
  batchId: number;
  quantity: number;
  cultureId: number;
  date: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fonction utilitaire pour les requêtes avec authentification
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = authService.getToken();

  if (!token) {
    throw new Error("Token d'authentification manquant");
  }

  const config: RequestInit = {
    ...options,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.body && { "Content-Type": "application/json" }),
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
      window.location.href = "/";
      throw new Error("Session expirée. Veuillez vous reconnecter.");
    }

    const errorText = await response.text();
    throw new Error(`Erreur ${response.status}: ${errorText || "Erreur serveur"}`);
  } catch (error) {
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new Error(
        "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
      );
    }
    throw error;
  }
};

export const cultureService = {
  // Lister toutes les cultures
  getAll: async (status?: string): Promise<Culture[]> => {
    const url = status
      ? `${API_BASE_URL}/cultures?status=${status}`
      : `${API_BASE_URL}/cultures`;
    const response = await fetchWithAuth(url);
    return await response.json();
  },

  // Récupérer une culture par ID
  getById: async (id: number): Promise<Culture> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/cultures/${id}`);
    return await response.json();
  },

  // Créer une culture
  create: async (data: CreateCultureDto): Promise<Culture> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/cultures`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(
        `Erreur ${response.status}: ${errorText || "Erreur lors de la création"}`
      );
    } catch (error) {
      console.error("❌ Erreur création culture:", error);
      throw error;
    }
  },

 // Mettre à jour une culture
update: async (id: number, data: Partial<CreateCultureDto>): Promise<Culture> => {
  try {
    // CORRECTION: Ne PAS convertir area en string - l'API attend un nombre
    const formattedData: any = {};
    
    if (data.name !== undefined) formattedData.name = data.name;
    if (data.area !== undefined) formattedData.area = data.area; // Garder comme nombre
    if (data.startDate !== undefined) formattedData.startDate = data.startDate;
    if (data.endDate !== undefined) formattedData.endDate = data.endDate;
    if (data.status !== undefined) formattedData.status = data.status;
    if (data.note !== undefined) formattedData.note = data.note;

    console.log('📝 Données formatées pour mise à jour:', formattedData);

    // CORRECTION: Utiliser la bonne URL - votre erreur montre /api/cultures mais vos autres endpoints sont /cultures
    const response = await fetchWithAuth(`${API_BASE_URL}/cultures/${id}`, {
      method: "PATCH",
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText || "Erreur lors de la mise à jour"}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Erreur mise à jour culture:", error);
    throw error;
  }
},

  // Supprimer une culture
  delete: async (id: number): Promise<Culture> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/cultures/${id}`, {
        method: "DELETE",
      });

      return await response.json();
    } catch (error) {
      console.error("❌ Erreur suppression culture:", error);
      throw error;
    }
  },

  // Enregistrer une récolte
  createHarvest: async (data: CreateHarvestDto): Promise<any> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/cultures/harvest`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(
        `Erreur ${response.status}: ${errorText || "Erreur lors de l'enregistrement de la récolte"}`
      );
    } catch (error) {
      console.error("❌ Erreur création récolte:", error);
      throw error;
    }
  },

  // Récupérer les récoltes d'une culture
  getHarvests: async (cultureId: number): Promise<Harvest[]> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/cultures/harvests?cultureId=${cultureId}`
    );
    return await response.json();
  },

  // Créer un événement pour une culture
  createEvent: async (data: CreateCultureEventDto): Promise<CultureEvent> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/cultures/events`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(
        `Erreur ${response.status}: ${errorText || "Erreur lors de la création de l'événement"}`
      );
    } catch (error) {
      console.error("❌ Erreur création événement culture:", error);
      throw error;
    }
  },

  // Récupérer les événements d'une culture
  getEvents: async (cultureId: number): Promise<CultureEvent[]> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/cultures/events?cultureId=${cultureId}`
    );
    return await response.json();
  },

  // Semer ou appliquer des intrants à une culture
  seed: async (data: SeedCultureDto): Promise<any> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/cultures/seed`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(
        `Erreur ${response.status}: ${errorText || "Erreur lors du semis/application"}`
      );
    } catch (error) {
      console.error("❌ Erreur semis/application:", error);
      throw error;
    }
  },

  // Récupérer tous les lots disponibles
  getBatches: async (): Promise<Batch[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/batches`);
    return await response.json();
  }
};