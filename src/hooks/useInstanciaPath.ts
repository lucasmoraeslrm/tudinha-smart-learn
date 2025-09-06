import { useParams } from 'react-router-dom';

export function useInstanciaPath() {
  const { instancia } = useParams();
  
  const getPath = (path: string) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // If we have an instance, prepend it
    if (instancia) {
      return `/${instancia}/${cleanPath}`;
    }
    
    // Otherwise return the original path
    return `/${cleanPath}`;
  };
  
  return {
    instancia,
    getPath,
    // Helper methods for common paths
    dashboard: () => getPath('dashboard'),
    chat: () => getPath('chat'),
    jornada: () => getPath('jornada'),
    exercicios: () => getPath('exercicios'),
    redacao: () => getPath('redacao'),
    logout: () => instancia ? `/${instancia}` : '/',
  };
}
