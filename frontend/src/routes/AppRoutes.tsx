import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/LoginPage';
import CulturePage from '../features/culture/CulturePage';
import ProduitPage from '../features/produits/ProduitPage';
import UserPage from '../features/utilisateurs/UserPage';
import AchatsPage from '../features/achat/AchatPage';
import AnimauxPage from '../features/animal/AnimauxPage';
import RecipePage from '../features/recipe/RecipePage';
import SalesPage from '../features/sales/SalesPage';
import FinancialDashboard from '../features/dashboard/FinancialDashboard';



const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />



      <Route path="/culture" element={<CulturePage />} />

      <Route path="/produit" element={<ProduitPage />} />
      <Route path="/recipe" element={<RecipePage />} />
      <Route path="/sale" element={<SalesPage />} />
      <Route path="/dashboard" element={<FinancialDashboard />} />

      <Route path="/utilisateur" element={<UserPage />} />
      <Route path="/achats" element={<AchatsPage />} />
      <Route path="/animal" element={<AnimauxPage />} />

     

    </Routes>
  );
};

export default AppRoutes;