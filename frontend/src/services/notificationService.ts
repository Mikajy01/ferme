import { toast } from 'react-toastify';

export const notificationService = {
  // Succès
  success: (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
    });
  },

  // Erreur
  error: (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
    });
  },

  // Avertissement
  warning: (message: string) => {
    toast.warn(message, {
      position: "top-right",
      autoClose: 4000,
    });
  },

  // Information
  info: (message: string) => {
    toast.info(message, {
      position: "top-right",
      autoClose: 3000,
    });
  },
};