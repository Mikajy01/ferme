/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from 'react';
import { 
  productService, 
  type Product, 
  type CreateProductDto, 
  type UpdateProductDto,
  type ProductsFilters,
  type DashboardStats
} from '../services/productService';
import { notificationService } from '../services/notificationService';

interface UseProductsReturn {
  products: Product[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string;
  filters: ProductsFilters;
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  productStocks: Record<number, number>;
  setFilters: (filters: ProductsFilters) => void;
  setPage: (page: number) => void;
  createProduct: (data: CreateProductDto) => Promise<void>;
  updateProduct: (id: number, data: UpdateProductDto) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductStock: (id: number) => Promise<number>;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [productStocks, setProductStocks] = useState<Record<number, number>>({});
  
  const [filters, setFiltersState] = useState<ProductsFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Charger les produits
  const loadProducts = useCallback(async (currentFilters: ProductsFilters = {}) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Chargement des produits avec filtres:', currentFilters);
      
      const response = await productService.getAll(currentFilters);
      
      console.log('📦 Réponse formatée:', response);
      
      setProducts(response.data);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalProducts(response.total);
      
      // Charger les stocks
      if (response.data && response.data.length > 0) {
        await loadProductStocks(response.data);
      } else {
        setProductStocks({});
      }
      
    } catch (err) {
      console.error('❌ Erreur chargement produits:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des produits';
      setError(errorMessage);
      setProducts([]);
      setProductStocks({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les stocks des produits
  const loadProductStocks = async (productsList: Product[]) => {
    try {
      const stocks: Record<number, number> = {};
      
      const stockPromises = productsList.map(async (product) => {
        try {
          const stock = await productService.getStock(product.id);
          stocks[product.id] = stock;
          console.log(`📊 Stock produit ${product.id}: ${stock}`);
        } catch (err) {
          console.warn(`❌ Erreur stock produit ${product.id}:`, err);
          stocks[product.id] = 0;
        }
      });
      
      await Promise.all(stockPromises);
      setProductStocks(stocks);
    } catch (err) {
      console.error('❌ Erreur chargement stocks:', err);
    }
  };

  // Mettre à jour les filtres
  const setFilters = useCallback((newFilters: ProductsFilters) => {
    setFiltersState(prev => {
      const updated = { ...prev, ...newFilters };
      return updated;
    });
  }, []);

  // Changer de page (désactivé si l'API ne supporte pas la pagination)
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    // Note: Votre API ne semble pas supporter la pagination côté serveur
    // La pagination devra être gérée côté client
  }, []);

  // Créer un produit
  const createProduct = async (data: CreateProductDto): Promise<void> => {
    try {
      setCreating(true);
      setError('');
      
      const newProduct = await productService.create(data);
      setProducts(prev => [...prev, newProduct]);
      notificationService.success('Produit créé avec succès');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Mettre à jour un produit
  const updateProduct = async (id: number, data: UpdateProductDto): Promise<void> => {
    try {
      setUpdating(true);
      setError('');
      
      const updatedProduct = await productService.update(id, data);
      
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      
      notificationService.success('Produit mis à jour avec succès');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Supprimer un produit
  const deleteProduct = async (id: number): Promise<void> => {
    try {
      setDeleting(true);
      setError('');
      
      await productService.delete(id);
      
      setProducts(prev => prev.filter(product => product.id !== id));
      notificationService.success('Produit supprimé avec succès');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Obtenir le stock d'un produit
  const getProductStock = async (id: number): Promise<number> => {
    try {
      const stock = await productService.getStock(id);
      setProductStocks(prev => ({ ...prev, [id]: stock }));
      return stock;
    } catch (err) {
      console.error('Erreur récupération stock:', err);
      return 0;
    }
  };

  // Charger les données initiales
  useEffect(() => {
    loadProducts(filters);
  }, [loadProducts]);

  // Charger les données quand les filtres changent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadProducts(filters);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [filters, loadProducts]);

  return {
    products,
    stats, // stats restera null car l'endpoint n'existe pas
    loading,
    error,
    filters,
    currentPage,
    totalPages,
    totalProducts,
    productStocks,
    setFilters,
    setPage,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStock,
    creating,
    updating,
    deleting
  };
};