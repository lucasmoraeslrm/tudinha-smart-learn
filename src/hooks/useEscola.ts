import { useAuth } from '@/contexts/AuthContext';

export function useEscola() {
  const { escola, profile } = useAuth();
  
  console.log('useEscola - escola:', escola);
  console.log('useEscola - profile:', profile);
  
  return {
    escola,
    isSchoolUser: profile && ['school_admin', 'coordinator'].includes(profile.role),
    hasEscola: !!escola,
  };
}