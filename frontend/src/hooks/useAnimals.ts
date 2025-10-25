import { useState, useEffect, useCallback } from 'react';
import { 
  animalService, 
  type Animal, 
  type CreateAnimalDto,
  type CreateAnimalEventDto,
  type FeedAnimalsDto,
  type AnimalEvent,
  type Batch
} from '../services/animalService';
import { notificationService } from '../services/notificationService';

interface UseAnimalsReturn {
  animals: Animal[];
  batches: Batch[];
  loading: boolean;
  error: string;
  creating: boolean;
  updating: boolean;
  feeding: boolean;
  createAnimal: (data: CreateAnimalDto) => Promise<void>;
  updateAnimal: (id: number, data: Partial<CreateAnimalDto>) => Promise<void>;
  feedAnimals: (data: FeedAnimalsDto) => Promise<void>;
  createAnimalEvent: (data: CreateAnimalEventDto) => Promise<void>;
  getAnimalEvents: (animalId: number) => Promise<AnimalEvent[]>;
  refreshAnimals: () => Promise<void>;
  refreshBatches: () => Promise<void>;
}

export const useAnimals = (): UseAnimalsReturn => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [feeding, setFeeding] = useState(false);

  // Charger les animaux
  const loadAnimals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      ;
      const data = await animalService.getAll();
      ;
      setAnimals(data || []);
      
    } catch (err) {
      console.error('❌ Erreur chargement animaux:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des animaux';
      setError(errorMessage);
      setAnimals([]);
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les lots
  const loadBatches = useCallback(async () => {
    try {
      ;
      const data = await animalService.getBatches();
      ;
      setBatches(data || []);
      
    } catch (err) {
      console.error('❌ Erreur chargement lots:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des lots';
      setError(errorMessage);
      setBatches([]);
    }
  }, []);

  // Rafraîchir les animaux
  const refreshAnimals = async () => {
    await loadAnimals();
  };

  // Rafraîchir les lots
  const refreshBatches = async () => {
    await loadBatches();
  };

  // Créer un animal
  const createAnimal = async (data: CreateAnimalDto): Promise<void> => {
    try {
      setCreating(true);
      setError('');
      
      ;
      const newAnimal = await animalService.create(data);
      ;
      
      setAnimals(prev => [...prev, newAnimal]);
      notificationService.success('Animal créé avec succès');
      
    } catch (err) {
      console.error('❌ Erreur création animal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'animal';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Mettre à jour un animal
  const updateAnimal = async (id: number, data: Partial<CreateAnimalDto>): Promise<void> => {
    try {
      setUpdating(true);
      setError('');
      
      ;
      const updatedAnimal = await animalService.update(id, data);
      ;
      
      setAnimals(prev => prev.map(animal => 
        animal.id === id ? updatedAnimal : animal
      ));
      notificationService.success('Animal mis à jour avec succès');
      
    } catch (err) {
      console.error('❌ Erreur mise à jour animal:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'animal';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Nourrir des animaux
  const feedAnimals = async (data: FeedAnimalsDto): Promise<void> => {
    try {
      setFeeding(true);
      setError('');
      
      ;
      const result = await animalService.feed(data);
      ;
      
      // Recharger les animaux pour mettre à jour les événements
      await loadAnimals();
      // Recharger les lots pour mettre à jour les stocks
      await loadBatches();
      
      notificationService.success('Animaux nourris avec succès');
      
    } catch (err) {
      console.error('❌ Erreur nourrissage animaux:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du nourrissage des animaux';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setFeeding(false);
    }
  };

  // Créer un événement pour un animal
  const createAnimalEvent = async (data: CreateAnimalEventDto): Promise<void> => {
    try {
      setError('');
      
      ;
      const newEvent = await animalService.createEvent(data);
      ;
      
      // Mettre à jour l'animal avec le nouvel événement
      setAnimals(prev => prev.map(animal => 
        animal.id === data.animalId 
          ? { 
              ...animal, 
              events: [...(animal.events || []), newEvent],
              totalExpenses: (animal.totalExpenses || 0) + parseFloat(newEvent.cost)
            }
          : animal
      ));
      
      notificationService.success('Événement créé avec succès');
      
    } catch (err) {
      console.error('❌ Erreur création événement:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'événement';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    }
  };

  // Récupérer les événements d'un animal
  const getAnimalEvents = async (animalId: number): Promise<AnimalEvent[]> => {
    try {
      return await animalService.getEvents(animalId);
    } catch (err) {
      console.error('❌ Erreur récupération événements:', err);
      return [];
    }
  };

  // Charger au montage
  useEffect(() => {
    loadAnimals();
    loadBatches();
  }, [loadAnimals, loadBatches]);

  return {
    animals,
    batches,
    loading,
    error,
    creating,
    updating,
    feeding,
    createAnimal,
    updateAnimal,
    feedAnimals,
    createAnimalEvent,
    getAnimalEvents,
    refreshAnimals,
    refreshBatches
  };
};