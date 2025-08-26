import { useAuth } from '@/contexts/AuthContext';

export function useEscola() {
  const { escola, profile } = useAuth();
  
  return {
    escola,
    isSchoolUser: profile && ['school_admin', 'coordinator'].includes(profile.role),
    hasEscola: !!escola,
  };
}