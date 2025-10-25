import { useState, useEffect, useCallback } from 'react';
import { 
  purchaseService, 
  type Purchase, 
  type CreatePurchaseDto 
} from '../services/purchaseService';
import { notificationService } from '../services/notificationService';

interface UsePurchasesReturn {
  purchases: Purchase[];
  loading: boolean;
  error: string;
  creating: boolean;
  deleting: boolean;
  createPurchase: (data: CreatePurchaseDto) => Promise<void>;
  deletePurchase: (id: number) => Promise<void>;
  refreshPurchases: () => Promise<void>;
}

export const usePurchases = (): UsePurchasesReturn => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Charger les achats
  const loadPurchases = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      ;
      const data = await purchaseService.getAll();
      ;
      setPurchases(data || []);
      
    } catch (err) {
      console.error('❌ Erreur chargement achats:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des achats';
      setError(errorMessage);
      setPurchases([]);
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchir les achats
  const refreshPurchases = async () => {
    await loadPurchases();
  };

  // Créer un achat
  const createPurchase = async (data: CreatePurchaseDto): Promise<void> => {
    try {
      setCreating(true);
      setError('');
      
      ;
      const newPurchase = await purchaseService.create(data);
      ;
      
      setPurchases(prev => [newPurchase, ...prev]);
      notificationService.success('Achat créé avec succès');
      
    } catch (err) {
      console.error('❌ Erreur création achat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'achat';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Supprimer un achat
  const deletePurchase = async (id: number): Promise<void> => {
    try {
      setDeleting(true);
      setError('');
      
      await purchaseService.delete(id);
      
      setPurchases(prev => prev.filter(purchase => purchase.id !== id));
      notificationService.success('Achat supprimé avec succès');
      
    } catch (err) {
      console.error('❌ Erreur suppression achat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'achat';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  return {
    purchases,
    loading,
    error,
    creating,
    deleting,
    createPurchase,
    deletePurchase,
    refreshPurchases
  };
};