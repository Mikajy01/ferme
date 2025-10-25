import { useState, useEffect } from 'react';
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
  createUnit: (data: CreateUnitDto) => Promise<void>;
  creating: boolean;
  refreshUnits: () => Promise<void>;
}

export const useUnits = (): UseUnitsReturn => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  // Charger les unités
  const loadUnits = async () => {
    try {
      setLoading(true);
      setError('');
      
      ;
      const data = await unitService.getAll();
      ;
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
  };

  // Rafraîchir les unités
  const refreshUnits = async () => {
    await loadUnits();
  };

  // Créer une unité
  const createUnit = async (data: CreateUnitDto): Promise<void> => {
    try {
      setCreating(true);
      setError('');
      
      ;
      const newUnit = await unitService.create(data);
      ;
      
      // Correction : S'assurer que newUnit est bien de type Unit
      setUnits(prev => [...prev, newUnit as unknown as Unit]);
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

  // Charger au montage
  useEffect(() => {
    loadUnits();
  }, []);

  return {
    units,
    loading,
    error,
    createUnit,
    creating,
    refreshUnits
  };
};