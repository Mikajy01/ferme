/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { 
  userService, 
  type ApiUser, 
  type CreateUserData, 
  type UsersFilters, 
  type DashboardStats,
  type UpdateUserStatusData 
} from '../services/userService';
import { notificationService } from '../services/notificationService';

interface UseUsersReturn {
  users: ApiUser[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string;
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  setFilters: (filters: UsersFilters) => void;
  setPage: (page: number) => void;
  createUser: (userData: CreateUserData) => Promise<void>;
  updateUserStatus: (session: string, statusData: UpdateUserStatusData) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState<UsersFilters>({
    page: 1,
    limit: 20
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Charger les utilisateurs
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      ;
      const response = await userService.getUsers(filters);
      
      ;
      setUsers(response.data);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setTotalUsers(response.total);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const statsData = await userService.getDashboardStats();
      setStats(statsData);
    } catch (err) {
      console.error('Erreur statistiques:', err);
    }
  };

  // Créer un utilisateur
  const createUser = async (userData: CreateUserData): Promise<void> => {
    try {
      setCreating(true);
      setError('');
      
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      notificationService.success('Utilisateur créé avec succès');
      
      await loadStats();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  // Mettre à jour le statut
  const updateUserStatus = async (session: string, statusData: UpdateUserStatusData): Promise<void> => {
    try {
      setUpdating(true);
      
      const updatedUser = await userService.updateUserStatus(session, statusData);
      
      setUsers(prev => 
        prev.map(user => 
          user.session === session ? updatedUser : user
        )
      );
      
      notificationService.success(`Utilisateur ${statusData.isActive ? 'activé' : 'désactivé'} avec succès`);
      
      await loadStats();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId: string): Promise<void> => {
    try {
      setDeleting(true);
      setError('');
      
      await userService.deleteUser(userId);
      
      setUsers(prev => prev.filter(user => user.idUser !== userId));
      notificationService.success('Utilisateur supprimé avec succès');
      
      await loadStats();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      notificationService.error(errorMessage);
      throw err;
    } finally {
      setDeleting(false);
    }
  };

  // Mettre à jour les filtres
  const handleSetFilters = (newFilters: UsersFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Changer de page
  const handleSetPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Charger les données quand les filtres changent
  useEffect(() => {
    loadUsers();
  }, [filters]);

  // Charger les stats au montage
  useEffect(() => {
    loadStats();
  }, []);

  return {
    users,
    stats,
    loading,
    error,
    currentPage,
    totalPages,
    totalUsers,
    setFilters: handleSetFilters,
    setPage: handleSetPage,
    createUser,
    updateUserStatus,
    deleteUser,
    creating,
    updating,
    deleting
  };
};