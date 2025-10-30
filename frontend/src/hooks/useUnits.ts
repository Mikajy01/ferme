import { useState, useEffect, useCallback } from 'react';
import { 
  unitService, 
  type Unit, 
  type CreateUnitDto 
} from '../services/productService';
import { notificationService } from '../services/notificationService';

interface UseUnitsReturn {
  units: Unit[];
  loading: boolean;
  error: string;
  creating: boolean;
  deleting: boolean;
  createUnit: (data: CreateUnitDto) => Promise<void>;
  deleteUnit: (id: number) => Promise<void>;
  refreshUnits: () => Promise<void>;
}

export const useUnits = (): UseUnitsReturn => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Charger les unités
  const loadUnits = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📥 Chargement des unités...');
      const data = await unitService.getAll();
      console.log('✅ Unités chargées:', data?.length);
      setUnits(data || []);

    } catch (err) {
      console.error('❌ Erreur chargement unités:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des unités';
      setError(errorMessage);
      setUnits([]);
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Rafraîchir les unités
  const refreshUnits = async () => {
    await loadUnits();
  };

  // Créer une unité
  const createUnit = async (data: CreateUnitDto): Promise<void> => {
    try {
      setCreating(true);
      setError('');

      console.log('📝 Création d\'une nouvelle unité:', data);
      const newUnit = await unitService.create(data);
      console.log('✅ Unité créée:', newUnit);

      setUnits(prev => [...prev, newUnit]);
      notificationService.success('Unité créée avec succès');

    } catch (err) {
      console.error('❌ Erreur création unité:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'unité';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Supprimer une unité
  const deleteUnit = async (id: number): Promise<void> => {
    try {
      setDeleting(true);
      setError('');

      console.log('🗑️ Suppression de l\'unité:', id);
      await unitService.delete(id);

      // Mettre à jour la liste localement
      setUnits(prev => prev.filter(unit => unit.id !== id));
      notificationService.success('Unité supprimée avec succès');

    } catch (err) {
      console.error('❌ Erreur suppression unité:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'unité';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  return {
    units,
    loading,
    error,
    creating,
    deleting,
    createUnit,
    deleteUnit,
    refreshUnits,
  };
};