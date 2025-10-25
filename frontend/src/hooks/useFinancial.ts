import { useState, useEffect, useCallback } from 'react';
import { 
  financialService, 
  type FinancialTransaction, 
  type FinancialBalance, 
  type MonthlySummary 
} from '../services/financialService';
import { notificationService } from '../services/notificationService';

interface UseFinancialReturn {
  // États
  transactions: FinancialTransaction[];
  balance: FinancialBalance | null;
  monthlySummary: MonthlySummary[];
  recentTransactions: FinancialTransaction[];
  loading: boolean;
  error: string;
  
  // Fonctions
  refreshTransactions: (startDate?: string, endDate?: string) => Promise<void>;
  refreshBalance: (startDate?: string, endDate?: string) => Promise<void>;
  refreshMonthlySummary: (year: number) => Promise<void>;
  refreshRecentTransactions: (limit?: number) => Promise<void>;
  refreshAll: (year?: number) => Promise<void>;
}

export const useFinancial = (): UseFinancialReturn => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [balance, setBalance] = useState<FinancialBalance | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger toutes les transactions
  const refreshTransactions = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError('');

      ;
      const data = await financialService.getAllTransactions(startDate, endDate);
      setTransactions(data);

    } catch (err) {
      console.error('❌ Erreur chargement transactions:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des transactions';
      setError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger le solde
  const refreshBalance = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      ;
      const data = await financialService.getBalance(startDate, endDate);
      setBalance(data);

    } catch (err) {
      console.error('❌ Erreur chargement solde:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du solde';
      setError(errorMessage);
      notificationService.error(errorMessage);
    }
  }, []);

  // Charger le résumé mensuel
  const refreshMonthlySummary = useCallback(async (year: number) => {
    try {
      ;
      const data = await financialService.getMonthlySummary(year);
      setMonthlySummary(data);

    } catch (err) {
      console.error('❌ Erreur chargement résumé mensuel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du résumé mensuel';
      setError(errorMessage);
      notificationService.error(errorMessage);
    }
  }, []);

  // Charger les transactions récentes
  const refreshRecentTransactions = useCallback(async (limit: number = 10) => {
    try {
      ;
      const data = await financialService.getRecentTransactions(limit);
      setRecentTransactions(data);

    } catch (err) {
      console.error('❌ Erreur chargement transactions récentes:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des transactions récentes';
      setError(errorMessage);
      notificationService.error(errorMessage);
    }
  }, []);

  // Charger toutes les données
  const refreshAll = useCallback(async (year?: number) => {
    try {
      setLoading(true);
      setError('');

      const currentYear = year || new Date().getFullYear();
      
      ;
      
      await Promise.all([
        refreshTransactions(),
        refreshBalance(),
        refreshMonthlySummary(currentYear),
        refreshRecentTransactions(5),
      ]);

      ;

    } catch (err) {
      console.error('❌ Erreur chargement données financières:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des données financières';
      setError(errorMessage);
      notificationService.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [refreshTransactions, refreshBalance, refreshMonthlySummary, refreshRecentTransactions]);

  // Charger au montage
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    transactions,
    balance,
    monthlySummary,
    recentTransactions,
    loading,
    error,
    refreshTransactions,
    refreshBalance,
    refreshMonthlySummary,
    refreshRecentTransactions,
    refreshAll,
  };
};