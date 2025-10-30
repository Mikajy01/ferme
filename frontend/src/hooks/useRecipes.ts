import { useState, useEffect, useCallback } from 'react';
import {
  recipeService,
  type Recipe,
  type ProductionBatch,
  type CreateRecipeDto,
  type CreateProductionDto,
  type Product,
  type Unit,
  type MaxProductionQuantity,
} from '../services/recipeService';
import { notificationService } from '../services/notificationService';

interface UseRecipesReturn {
  // États
  recipes: Recipe[];
  productionBatches: ProductionBatch[];
  products: Product[];
  units: Unit[];
  loading: boolean;
  error: string;
  creatingRecipe: boolean;
  creatingProduction: boolean;
  deletingRecipe: boolean;
  
  // Fonctions pour les recettes
  createRecipe: (data: CreateRecipeDto) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
  getRecipeById: (id: number) => Promise<Recipe>;
  refreshRecipes: () => Promise<void>;
  
  // Fonctions pour la production
  createProductionBatch: (data: CreateProductionDto) => Promise<void>;
  getProductionBatchById: (id: number) => Promise<ProductionBatch>;
  getMaxProductionQuantity: (recipeId: number) => Promise<MaxProductionQuantity>;
  refreshProductionBatches: () => Promise<void>;
  
  // Fonctions utilitaires
  refreshProducts: () => Promise<void>;
  refreshUnits: () => Promise<void>;
}

export const useRecipes = (): UseRecipesReturn => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creatingRecipe, setCreatingRecipe] = useState(false);
  const [creatingProduction, setCreatingProduction] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState(false);

  // Charger les recettes
  const loadRecipes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📥 Chargement des recettes...');
      const data = await recipeService.getAllRecipes();
      console.log('✅ Recettes chargées:', data?.length);
      setRecipes(data || []);

    } catch (err) {
      console.error('❌ Erreur chargement recettes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des recettes';
      setError(errorMessage);
      setRecipes([]);
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les lots de production
  const loadProductionBatches = useCallback(async () => {
    try {
      console.log('📥 Chargement des lots de production...');
      const data = await recipeService.getAllProductionBatches();
      console.log('✅ Lots de production chargés:', data?.length);
      setProductionBatches(data || []);

    } catch (err) {
      console.error('❌ Erreur chargement lots production:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des lots de production';
      setError(errorMessage);
      setProductionBatches([]);
    }
  }, []);

  // Charger les produits
  const loadProducts = useCallback(async () => {
    try {
      console.log('📥 Chargement des produits...');
      const data = await recipeService.getProducts();
      console.log('✅ Produits chargés:', data?.length);
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
      console.log('📥 Chargement des unités...');
      const data = await recipeService.getUnits();
      console.log('✅ Unités chargées:', data?.length);
      setUnits(data || []);

    } catch (err) {
      console.error('❌ Erreur chargement unités:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des unités';
      setError(errorMessage);
      setUnits([]);
    }
  }, []);

  // Rafraîchir les recettes
  const refreshRecipes = async () => {
    await loadRecipes();
  };

  // Rafraîchir les lots de production
  const refreshProductionBatches = async () => {
    await loadProductionBatches();
  };

  // Rafraîchir les produits
  const refreshProducts = async () => {
    await loadProducts();
  };

  // Rafraîchir les unités
  const refreshUnits = async () => {
    await loadUnits();
  };

  // Créer une recette
  const createRecipe = async (data: CreateRecipeDto): Promise<void> => {
    try {
      setCreatingRecipe(true);
      setError('');

      console.log('📝 Création d\'une nouvelle recette:', data);
      const newRecipe = await recipeService.createRecipe(data);
      console.log('✅ Recette créée:', newRecipe);

      setRecipes(prev => [...prev, newRecipe]);
      notificationService.success('Recette créée avec succès');

    } catch (err) {
      console.error('❌ Erreur création recette:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la recette';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setCreatingRecipe(false);
    }
  };

  // Supprimer une recette
  const deleteRecipe = async (id: number): Promise<void> => {
    try {
      setDeletingRecipe(true);
      setError('');

      console.log('🗑️ Suppression de la recette:', id);
      await recipeService.deleteRecipe(id);

      // Mettre à jour la liste localement
      setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      notificationService.success('Recette supprimée avec succès');

    } catch (err) {
      console.error('❌ Erreur suppression recette:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de la recette';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setDeletingRecipe(false);
    }
  };

  // Récupérer une recette par ID
  const getRecipeById = async (id: number): Promise<Recipe> => {
    try {
      return await recipeService.getRecipeById(id);
    } catch (err) {
      console.error('❌ Erreur récupération recette:', err);
      throw err;
    }
  };

  // Créer un lot de production
  const createProductionBatch = async (data: CreateProductionDto): Promise<void> => {
    try {
      setCreatingProduction(true);
      setError('');

      console.log('🏭 Création d\'un lot de production:', data);
      const newBatch = await recipeService.createProductionBatch(data);
      console.log('✅ Lot de production créé:', newBatch);

      setProductionBatches(prev => [newBatch, ...prev]);
      notificationService.success('Lot de production créé avec succès');

    } catch (err) {
      console.error('❌ Erreur création lot production:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du lot de production';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setCreatingProduction(false);
    }
  };

  // Récupérer un lot de production par ID
  const getProductionBatchById = async (id: number): Promise<ProductionBatch> => {
    try {
      return await recipeService.getProductionBatchById(id);
    } catch (err) {
      console.error('❌ Erreur récupération lot production:', err);
      throw err;
    }
  };

  // Obtenir la quantité maximale produisible
  const getMaxProductionQuantity = async (recipeId: number): Promise<MaxProductionQuantity> => {
    try {
      return await recipeService.getMaxProductionQuantity(recipeId);
    } catch (err) {
      console.error('❌ Erreur récupération quantité max:', err);
      throw err;
    }
  };

  // Charger au montage
  useEffect(() => {
    loadRecipes();
    loadProductionBatches();
    loadProducts();
    loadUnits();
  }, [loadRecipes, loadProductionBatches, loadProducts, loadUnits]);

  return {
    recipes,
    productionBatches,
    products,
    units,
    loading,
    error,
    creatingRecipe,
    creatingProduction,
    deletingRecipe,
    createRecipe,
    deleteRecipe,
    getRecipeById,
    refreshRecipes,
    createProductionBatch,
    getProductionBatchById,
    getMaxProductionQuantity,
    refreshProductionBatches,
    refreshProducts,
    refreshUnits,
  };
};