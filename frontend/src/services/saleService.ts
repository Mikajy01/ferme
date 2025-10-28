/* eslint-disable @typescript-eslint/no-explicit-any */

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

export interface ProductionBatch {
  id: number;
  recipeId: number;
  outputProductId: number;
  outputQuantity: number;
  date: string;
  costTotal: number;
  remaining?: number;
  recipe?: {
    id: number;
    name: string;
    description: string;
  };
  purchaseItemId?: number | null;
  unitPrice?: number;
  expiryDate?: string | null;
  outputProduct?: Product;
  inventoryMovements?: any[];
}

export interface Batch {
  id: number;
  productId: number;
  purchaseItemId: number | null;
  quantity: number;
  remaining: number;
  unitPrice: number;
  receivedAt: string;
  expiryDate: string | null;
  createdAt: string;
  product?: Product;
}

export interface SaleItem {
  id?: number;
  saleId?: number;
  productId: number;
  productionBatchId: number;
  quantity: number;
  unitPrice: number;
  product?: Product;
  productionBatch?: ProductionBatch;
}

export interface FinancialTransaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  note: string;
  purchaseId: number | null;
  saleId: number;
  productionId: number | null;
}

export interface Sale {
  id: number;
  customer: string;
  date: string;
  totalAmount: number;
  items: SaleItem[];
  financialTransaction?: FinancialTransaction;
}

export interface CreateSaleDto {
  customer: string;
  date: string;
  items: Omit<SaleItem, 'id' | 'saleId'>[];
}

export interface CreateSaleItemDto {
  productId: number;
  productionBatchId: number;
  quantity: number;
  unitPrice: number;
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

export const saleService = {
  // Lister toutes les ventes
  getAllSales: async (): Promise<Sale[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/sales`);
    return await response.json();
  },

  // Récupérer une vente par ID
  getSaleById: async (id: number): Promise<Sale> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/sales/${id}`);
    return await response.json();
  },

  // Créer une vente - VERSION AVEC DÉBOGAGE COMPLET
  createSale: async (data: CreateSaleDto): Promise<FinancialTransaction> => {
    try {
      console.log('🚀 DEBUT - Création de vente');
      console.log('📦 Données envoyées pour création vente:', JSON.stringify(data, null, 2));
      
      // Validation des données avant envoi
      if (!data.customer || !data.date || !data.items || data.items.length === 0) {
        throw new Error('Données de vente incomplètes');
      }

      // Validation détaillée de chaque item
      data.items.forEach((item, index) => {
        console.log(`🔍 Validation item ${index + 1}:`, {
          productId: item.productId,
          productionBatchId: item.productionBatchId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productIdType: typeof item.productId,
          productionBatchIdType: typeof item.productionBatchId
        });

        if (!item.productId || item.productId <= 0) {
          throw new Error(`Item ${index + 1}: Produit invalide (ID: ${item.productId})`);
        }
        if (!item.productionBatchId || item.productionBatchId <= 0) {
          throw new Error(`Item ${index + 1}: Lot de production invalide (ID: ${item.productionBatchId})`);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Item ${index + 1}: Quantité invalide (${item.quantity})`);
        }
        if (item.unitPrice === null || item.unitPrice === undefined || item.unitPrice < 0) {
          throw new Error(`Item ${index + 1}: Prix unitaire invalide (${item.unitPrice})`);
        }
      });

      console.log('📤 Envoi de la requête à l\'API...');
      const response = await fetchWithAuth(`${API_BASE_URL}/sales`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      console.log('📥 Réponse reçue - Status:', response.status);

      if (response.status === 201) {
        const result = await response.json();
        console.log('✅ Vente créée avec succès:', result);
        return result;
      }

      const errorText = await response.text();
      console.error('❌ Erreur détaillée création vente:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      
      // Analyse détaillée de l'erreur
      let errorMessage = `Erreur ${response.status}: ${errorText || "Erreur lors de la création de la vente"}`;
      
      if (errorText.includes('foreign key constraint')) {
        if (errorText.includes('productId')) {
          errorMessage = 'ERREUR CLÉ ÉTRANGÈRE: Le produit sélectionné n\'existe pas en base de données';
        } else if (errorText.includes('productionBatchId')) {
          errorMessage = 'ERREUR CLÉ ÉTRANGÈRE: Le lot de production sélectionné n\'existe pas en base de données';
        } else if (errorText.includes('saleId')) {
          errorMessage = 'ERREUR CLÉ ÉTRANGÈRE: Problème avec l\'ID de vente';
        } else {
          errorMessage = 'ERREUR CLÉ ÉTRANGÈRE: Violation de contrainte - vérifiez que tous les IDs existent en base de données';
        }
        
        // Ajouter les IDs problématiques dans le message
        errorMessage += `\nIDs envoyés: Produit=${data.items[0]?.productId}, Lot=${data.items[0]?.productionBatchId}`;
      }
      
      throw new Error(errorMessage);

    } catch (error) {
      console.error("💥 Erreur finale création vente:", error);
      throw error;
    }
  },

  // Supprimer une vente
  deleteSale: async (id: number): Promise<void> => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/sales/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText || "Erreur lors de la suppression"}`);
      }
    } catch (error) {
      console.error("❌ Erreur suppression vente:", error);
      throw error;
    }
  },

  // Récupérer tous les produits vendables
  getSellableProducts: async (): Promise<Product[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/products`);
    const products = await response.json();
    return products.filter((p: Product) => p.isSellable);
  },

  // Récupérer TOUS les lots de production - VERSION CORRIGÉE
  getAllBatches: async (): Promise<Batch[]> => {
    try {
      console.log('🔄 Récupération de tous les lots de production depuis /api/production...');
      const response = await fetchWithAuth(`${API_BASE_URL}/batches`);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const batches = await response.json();
      console.log('✅ Réponse brute de l\'API:', batches);
      
      // Vérifier que batches est un tableau
      if (!Array.isArray(batches)) {
        console.error('❌ Les lots de production ne sont pas un tableau:', batches);
        return [];
      }
      
      console.log(`📊 Nombre de lots récupérés: ${batches.length}`);
      console.log(`📋 IDs des lots:`, batches.map((b: any) => b.id));
      
      return batches;

    } catch (error) {
      console.error("❌ Erreur récupération lots de production:", error);
      return [];
    }
  },

  // Récupérer les lots disponibles pour un produit spécifique - VERSION CORRIGÉE
  getAvailableBatches: async (productId: number): Promise<Batch[]> => {
    try {
      console.log(`🔄 Récupération des lots disponibles pour produit ${productId}...`);
      
      // Récupérer tous les lots depuis /api/batches
      const allBatches = await saleService.getAllBatches();
      
      console.log(`📊 Total des lots à filtrer: ${allBatches.length}`);
      
      // Filtrer les lots pour le produit spécifié
      const batchesForProduct = allBatches.filter(batch => {
        const matches = batch.productId === productId;
        console.log(`🔍 Lot ${batch.id} - Produit: ${batch.productId}, Recherché: ${productId}, Match: ${matches}`);
        return matches;
      });
      
      console.log(`✅ Lots disponibles pour produit ${productId}:`, batchesForProduct.map(b => b.id));
      return batchesForProduct;

    } catch (error) {
      console.error("❌ Erreur récupération lots disponibles:", error);
      return [];
    }
  },

  // Récupérer toutes les unités
  getUnits: async (): Promise<Unit[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/units`);
    return await response.json();
  },

  // Vérifier si un produit existe
  checkProductExists: async (productId: number): Promise<boolean> => {
    try {
      console.log(`🔍 Vérification existence produit ${productId}...`);
      const response = await fetchWithAuth(`${API_BASE_URL}/products/${productId}`);
      const exists = response.status === 200;
      console.log(`✅ Produit ${productId} existe:`, exists);
      return exists;
    } catch (error) {
      console.error(`❌ Erreur vérification produit ${productId}:`, error);
      return false;
    }
  },

  // Vérifier si un lot existe - VERSION CORRIGÉE
  checkBatchExists: async (batchId: number): Promise<boolean> => {
    try {
      console.log(`🔍 Vérification existence lot ${batchId}...`);
      
      // Récupérer tous les lots et vérifier si l'ID existe
      const allBatches = await saleService.getAllBatches();
      console.log(`📊 Total des lots récupérés: ${allBatches.length}`);
      console.log(`📋 IDs des lots:`, allBatches.map(b => b.id));
      
      const exists = allBatches.some(batch => {
        const match = batch.id === batchId;
        if (match) {
          console.log(`🎯 Lot ${batchId} TROUVÉ !`);
        }
        return match;
      });
      
      console.log(`✅ Lot ${batchId} existe:`, exists);
      
      if (!exists) {
        console.log(`❌ Lot ${batchId} NON TROUVÉ dans la liste des lots`);
      }
      
      return exists;

    } catch (error) {
      console.error(`❌ Erreur vérification lot ${batchId}:`, error);
      return false;
    }
  },

  // NOUVELLE MÉTHODE: Récupérer un lot spécifique par ID
  getBatchById: async (batchId: number): Promise<Batch | null> => {
    try {
      console.log(`🔍 Récupération du lot ${batchId}...`);
      
      const allBatches = await saleService.getAllBatches();
      const batch = allBatches.find(b => b.id === batchId);
      
      console.log(`✅ Lot ${batchId} récupéré:`, batch);
      return batch || null;

    } catch (error) {
      console.error(`❌ Erreur récupération lot ${batchId}:`, error);
      return null;
    }
  }
};