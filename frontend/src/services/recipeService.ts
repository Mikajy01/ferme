
import { authService } from './authService';

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

export interface RecipeIngredient {
  id?: number;
  recipeId?: number;
  productId: number;
  quantity: number;
  unitId: number;
  product?: Product;
  unit?: Unit;
}

export interface Recipe {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  outputProductId: number;
  outputQuantity: number;
  ingredients: RecipeIngredient[];
  outputProduct?: Product;
}

export interface CreateRecipeDto {
  name: string;
  description: string;
  outputProductId: number;
  outputQuantity: number;
  ingredients: Omit<RecipeIngredient, 'id' | 'recipeId'>[];
}

export interface ProductionBatch {
  id: number;
  recipeId: number;
  outputProductId: number;
  outputQuantity: number;
  date: string;
  costTotal: number;
  recipe?: Recipe;
  outputProduct?: Product;
  inventoryMovements?: InventoryMovement[];
}

export interface CreateProductionDto {
  recipeId: number;
  outputProductId: number;
  outputQuantity: number;
  date: string;
}

export interface InventoryMovement {
  id: number;
  type: 'IN' | 'OUT';
  productId: number;
  batchId: number;
  productionBatchId: number;
  quantity: number;
  date: string;
  reference: string;
  note: string | null;
}

export interface MaxProductionQuantity {
  recipeId: number;
  recipeName: string;
  outputProductId: number;
  outputProductName: string;
  outputQuantityPerBatch: number;
  maxProducible: number;
  maxCompleteBatches: number;
  limitingIngredient: {
    productId: number;
    productName: string;
    available: number;
    required: number;
  };
  ingredientsStatus: Array<{
    productId: number;
    productName: string;
    requiredPerBatch: number;
    available: number;
    maxBatches: number;
  }>;
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

export const recipeService = {
  // Lister toutes les recettes
  getAllRecipes: async (): Promise<Recipe[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/recipes`);
    return await response.json();
  },

  // Récupérer une recette par ID
  getRecipeById: async (id: number): Promise<Recipe> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/recipes/${id}`);
    return await response.json();
  },

  // Créer une recette
  createRecipe: async (data: CreateRecipeDto): Promise<Recipe> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/recipes`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(
        `Erreur ${response.status}: ${errorText || "Erreur lors de la création de la recette"}`
      );
    } catch (error) {
      console.error("❌ Erreur création recette:", error);
      throw error;
    }
  },

  // Lister tous les lots de production
  getAllProductionBatches: async (): Promise<ProductionBatch[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/production`);
    return await response.json();
  },

  // Récupérer un lot de production par ID
  getProductionBatchById: async (id: number): Promise<ProductionBatch> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/production/${id}`);
    return await response.json();
  },

  // Créer un lot de production
  createProductionBatch: async (data: CreateProductionDto): Promise<ProductionBatch> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/production`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        return await response.json();
      }

      const errorText = await response.text();
      throw new Error(
        `Erreur ${response.status}: ${errorText || "Erreur lors de la création du lot de production"}`
      );
    } catch (error) {
      console.error("❌ Erreur création lot production:", error);
      throw error;
    }
  },

  // Obtenir la quantité maximale produisible pour une recette
  getMaxProductionQuantity: async (recipeId: number): Promise<MaxProductionQuantity> => {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/production/recipe/${recipeId}/max-quantity`
    );
    return await response.json();
  },

  // Récupérer tous les produits (pour les sélecteurs)
  getProducts: async (): Promise<Product[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/products`);
    return await response.json();
  },

  // Récupérer toutes les unités
  getUnits: async (): Promise<Unit[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/units`);
    return await response.json();
  }
};