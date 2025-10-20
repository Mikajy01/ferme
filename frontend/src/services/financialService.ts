/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService } from './authService';

export interface FinancialTransaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  note: string;
  purchaseId: number | null;
  saleId: number | null;
  productionId: number | null;
  purchase?: {
    id: number;
    supplier: string;
    date: string;
    totalAmount: number;
    createdAt: string;
  };
  sale?: {
    id: number;
    customer: string;
    date: string;
    totalAmount: number;
  };
  production?: any;
}

export interface FinancialBalance {
  income: number;
  expense: number;
  balance: number;
  transactions: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
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

export const financialService = {
  // Lister toutes les transactions financières
  getAllTransactions: async (startDate?: string, endDate?: string): Promise<FinancialTransaction[]> => {
    try {
      let url = `${API_BASE_URL}/financial`;
      
      // Ajouter les paramètres de date si fournis
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('🔄 Récupération des transactions financières...');
      const response = await fetchWithAuth(url);
      const transactions = await response.json();
      
      console.log('✅ Transactions récupérées:', transactions);
      return transactions.map((transaction: any) => ({
        ...transaction,
        amount: parseFloat(transaction.amount),
      }));
    } catch (error) {
      console.error('❌ Erreur récupération transactions:', error);
      throw error;
    }
  },

  // Récupérer le solde financier
  getBalance: async (startDate?: string, endDate?: string): Promise<FinancialBalance> => {
    try {
      let url = `${API_BASE_URL}/financial/balance`;
      
      // Ajouter les paramètres de date si fournis
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log('🔄 Récupération du solde financier...');
      const response = await fetchWithAuth(url);
      const balance = await response.json();
      
      console.log('✅ Solde récupéré:', balance);
      return {
        ...balance,
        income: parseFloat(balance.income),
        expense: parseFloat(balance.expense),
        balance: parseFloat(balance.balance),
      };
    } catch (error) {
      console.error('❌ Erreur récupération solde:', error);
      throw error;
    }
  },

  // Récupérer le résumé mensuel
  getMonthlySummary: async (year: number): Promise<MonthlySummary[]> => {
    try {
      console.log(`🔄 Récupération du résumé mensuel pour ${year}...`);
      const response = await fetchWithAuth(`${API_BASE_URL}/financial/monthly/${year}`);
      const monthlyData = await response.json();
      
      console.log('✅ Résumé mensuel récupéré:', monthlyData);
      return monthlyData.map((month: any) => ({
        ...month,
        income: parseFloat(month.income),
        expense: parseFloat(month.expense),
      }));
    } catch (error) {
      console.error('❌ Erreur récupération résumé mensuel:', error);
      throw error;
    }
  },

  // Récupérer les transactions récentes (limitées)
  getRecentTransactions: async (limit: number = 10): Promise<FinancialTransaction[]> => {
    try {
      console.log(`🔄 Récupération des ${limit} dernières transactions...`);
      const allTransactions = await financialService.getAllTransactions();
      const recentTransactions = allTransactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
      
      console.log('✅ Transactions récentes récupérées:', recentTransactions);
      return recentTransactions;
    } catch (error) {
      console.error('❌ Erreur récupération transactions récentes:', error);
      throw error;
    }
  },
};