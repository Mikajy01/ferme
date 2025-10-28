import { useState, useEffect, useCallback } from 'react';
import { saleService, type Sale, type CreateSaleDto, type Product, type ProductionBatch, type Unit, type Batch } from '../services/saleService';
import { notificationService } from '../services/notificationService';

interface UseSalesReturn {
  // États
  sales: Sale[];
  products: Product[];
  availableBatches: Batch[];
  units: Unit[];
  loading: boolean;
  error: string;
  creating: boolean;
  deleting: boolean;
  availableBatchesLoading: boolean;
  
  // Fonctions
  createSale: (data: CreateSaleDto) => Promise<void>;
  deleteSale: (id: number) => Promise<void>;
  loadAvailableBatches: (productId: number) => Promise<void>;
  refreshSales: () => Promise<void>;
  checkProductExists: (productId: number) => Promise<boolean>;
  checkBatchExists: (batchId: number) => Promise<boolean>;
  getBatchById: (batchId: number) => Promise<Batch | null>;
}

export const useSales = (): UseSalesReturn => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableBatches, setAvailableBatches] = useState<Batch[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [availableBatchesLoading, setAvailableBatchesLoading] = useState(false);

  // Charger les ventes
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 Chargement des ventes...');
      const data = await saleService.getAllSales();
      console.log('✅ Ventes chargées:', data);
      setSales(data || []);

    } catch (err) {
      console.error('❌ Erreur chargement ventes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des ventes';
      setError(errorMessage);
      setSales([]);
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les produits
  const loadProducts = useCallback(async () => {
    try {
      console.log('🔄 Chargement des produits...');
      const data = await saleService.getSellableProducts();
      console.log('✅ Produits chargés:', data);
      setProducts(data || []);

    } catch (err) {
      console.error('❌ Erreur chargement produits:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des produits';
      setError(errorMessage);
      setProducts([]);
    }
  }, []);

  // Charger les unités
  const loadUnits = useCallback(async () => {
    try {
      console.log('🔄 Chargement des unités...');
      const data = await saleService.getUnits();
      console.log('✅ Unités chargées:', data);
      setUnits(data || []);

    } catch (err) {
      console.error('❌ Erreur chargement unités:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des unités';
      setError(errorMessage);
      setUnits([]);
    }
  }, []);

  // Charger les lots disponibles pour un produit
  const loadAvailableBatches = async (productId: number) => {
    try {
      if (!productId || productId <= 0) {
        setAvailableBatches([]);
        return;
      }

      setAvailableBatchesLoading(true);
      console.log(`🔄 Chargement des lots disponibles pour produit ${productId}...`);
      
      const batches = await saleService.getAvailableBatches(productId);
      console.log(`✅ Lots disponibles chargés pour produit ${productId}:`, batches);
      
      setAvailableBatches(batches || []);

    } catch (err) {
      console.error('❌ Erreur chargement lots disponibles:', err);
      setAvailableBatches([]);
    } finally {
      setAvailableBatchesLoading(false);
    }
  };

  // Vérifier si un produit existe
  const checkProductExists = async (productId: number): Promise<boolean> => {
    try {
      console.log(`🔍 Vérification existence produit ${productId}...`);
      const exists = await saleService.checkProductExists(productId);
      console.log(`✅ Produit ${productId} existe:`, exists);
      return exists;
    } catch (error) {
      console.error(`❌ Erreur vérification produit ${productId}:`, error);
      return false;
    }
  };

  // Vérifier si un lot existe
  const checkBatchExists = async (batchId: number): Promise<boolean> => {
    try {
      console.log(`🔍 Vérification existence lot ${batchId}...`);
      const exists = await saleService.checkBatchExists(batchId);
      console.log(`✅ Lot ${batchId} existe:`, exists);
      return exists;
    } catch (error) {
      console.error(`❌ Erreur vérification lot ${batchId}:`, error);
      return false;
    }
  };

  // Récupérer un lot par ID
  const getBatchById = async (batchId: number): Promise<Batch | null> => {
    try {
      console.log(`🔍 Récupération du lot ${batchId}...`);
      const batch = await saleService.getBatchById(batchId);
      console.log(`✅ Lot ${batchId} récupéré:`, batch);
      return batch;
    } catch (error) {
      console.error(`❌ Erreur récupération lot ${batchId}:`, error);
      return null;
    }
  };

  // Rafraîchir les ventes
  const refreshSales = async () => {
    await loadSales();
  };

  // Créer une vente
  const createSale = async (data: CreateSaleDto): Promise<void> => {
    try {
      setCreating(true);
      setError('');

      console.log('🆕 Création vente:', JSON.stringify(data, null, 2));
      
      // Validation supplémentaire côté client
      if (!data.customer?.trim()) {
        throw new Error('Le nom du client est obligatoire');
      }

      if (!data.items || data.items.length === 0) {
        throw new Error('Au moins un article est requis');
      }

      // Valider chaque item de manière plus robuste
      data.items.forEach((item, index) => {
        const itemNumber = index + 1;
        
        if (!item.productId || item.productId <= 0) {
          throw new Error(`Article ${itemNumber}: Produit invalide (ID: ${item.productId})`);
        }
        if (!item.productionBatchId || item.productionBatchId <= 0) {
          throw new Error(`Article ${itemNumber}: Lot de production invalide (ID: ${item.productionBatchId})`);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Article ${itemNumber}: Quantité invalide (${item.quantity})`);
        }
        if (item.unitPrice === null || item.unitPrice === undefined || item.unitPrice < 0) {
          throw new Error(`Article ${itemNumber}: Prix unitaire invalide (${item.unitPrice})`);
        }
        
        console.log(`✅ Article ${itemNumber} validé:`, item);
      });

      const result = await saleService.createSale(data);
      console.log('✅ Vente créée avec succès:', result);

      // Recharger les ventes
      await loadSales();
      notificationService.success('Vente créée avec succès');

    } catch (err) {
      console.error('❌ Erreur création vente:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la vente';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Supprimer une vente
  const deleteSale = async (id: number): Promise<void> => {
    try {
      setDeleting(true);
      setError('');

      console.log(`🗑️ Suppression vente ${id}...`);
      await saleService.deleteSale(id);
      console.log('✅ Vente supprimée avec succès');

      // Recharger les ventes
      await loadSales();
      notificationService.success('Vente supprimée avec succès');

    } catch (err) {
      console.error('❌ Erreur suppression vente:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la vente';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadSales();
    loadProducts();
    loadUnits();
  }, [loadSales, loadProducts, loadUnits]);

  return {
    sales,
    products,
    availableBatches,
    units,
    loading,
    error,
    creating,
    deleting,
    availableBatchesLoading,
    createSale,
    deleteSale,
    loadAvailableBatches,
    refreshSales,
    checkProductExists,
    checkBatchExists,
    getBatchById,
  };
};