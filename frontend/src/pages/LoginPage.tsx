import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    session: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs
    if (!formData.session.trim() || !formData.password.trim()) {
      return;
    }

    try {
      await login(formData);
      
      // Navigation après un petit délai pour voir le toast
      setTimeout(() => {
        navigate('/produit');
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-secondary)] via-white to-[var(--color-accent)] flex">
      {/* Left Side - Decorative Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] items-center justify-center p-12 animate-lazy-slow">
        <div className="text-center text-white max-w-md">
          <div className="bg-opacity-2 flex items-center justify-center mx-auto mb-8">
            <img 
              src="/src/assets/login.png" 
              alt="Farm Management Logo" 
              className="w-[160px] h-[160px]"
            />
          </div>
          <h3 className="text-4xl font-bold mb-6">Farm Management</h3>
          <p className="text-white text-opacity-90 text-lg leading-relaxed">
            Votre solution complète de gestion agricole. Suivez les dépenses, surveillez les ventes et optimisez vos opérations agricoles en un seul endroit.
          </p>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 animate-lazy">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center mr-3">
                <img 
                  src="/src/assets/logo.png" 
                  alt="Spacer Logo" 
                  className="w-[70px] h-[70px]"
                />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-[var(--color-text)] mb-4">
              Content de vous revoir
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-lazy">
              <Input
                label="Session"
                type="text"
                name="session"
                placeholder="Entrez votre session"
                value={formData.session}
                onChange={handleChange}
                required
              />
            </div>

            <div className="animate-lazy">
              <Input
                label="Mot de passe"
                type="password"
                name="password"
                placeholder="Entrez votre mot de passe"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="animate-lazy">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full py-4 text-lg font-semibold rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;