import { useState, useEffect } from 'react';

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Por enquanto, vamos considerar que se o usuário tem um parâmetro específico
    // ou está logado com um email específico, ele é admin
    // Você pode modificar essa lógica conforme sua necessidade
    const adminCheck = localStorage.getItem('is_admin') === 'true' || 
                       window.location.search.includes('admin=true');
    setIsAdmin(adminCheck);
  }, []);

  const setAdminMode = (value: boolean) => {
    localStorage.setItem('is_admin', value.toString());
    setIsAdmin(value);
  };

  return { isAdmin, setAdminMode };
}