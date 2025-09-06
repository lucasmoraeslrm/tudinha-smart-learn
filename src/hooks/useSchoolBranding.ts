import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SchoolBranding {
  id: string;
  nome: string;
  instancia: string | null;
  codigo: string;
  dominio: string | null;
  logo_url: string | null;
  cor_primaria: string;
  cor_secundaria: string;
}

// Converte HEX para HSL para compatibilidade com CSS variables
const hexToHsl = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h! /= 6;
  }

  return `${Math.round(h! * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export function useSchoolBranding(instancia?: string | null) {
  const [branding, setBranding] = useState<SchoolBranding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyBrandingToCSS = (brandingData: SchoolBranding) => {
    const root = document.documentElement;
    
    try {
      // Aplicar cores primárias e secundárias
      if (brandingData.cor_primaria && brandingData.cor_primaria.startsWith('#')) {
        const primaryHsl = hexToHsl(brandingData.cor_primaria);
        root.style.setProperty('--primary', primaryHsl);
      }
      
      if (brandingData.cor_secundaria && brandingData.cor_secundaria.startsWith('#')) {
        const secondaryHsl = hexToHsl(brandingData.cor_secundaria);
        root.style.setProperty('--secondary', secondaryHsl);
      }
    } catch (e) {
      console.warn('Erro ao aplicar cores da escola:', e);
    }
  };

  const resetBrandingCSS = () => {
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
  };

  const fetchBrandingByInstancia = async (instanciaSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_escola_branding_by_instancia', { p_instancia: instanciaSlug });

      if (rpcError) throw rpcError;

      if (data && data.length > 0) {
        const brandingData = data[0];
        setBranding(brandingData);
        applyBrandingToCSS(brandingData);
        return brandingData;
      } else {
        setBranding(null);
        resetBrandingCSS();
        return null;
      }
    } catch (err: any) {
      console.error('Erro ao buscar branding por instância:', err);
      setError(err.message);
      setBranding(null);
      resetBrandingCSS();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandingByDomain = async (domain: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase
        .rpc('get_escola_branding_by_domain', { p_domain: domain });

      if (rpcError) throw rpcError;

      if (data && data.length > 0) {
        const brandingData = data[0];
        setBranding(brandingData);
        applyBrandingToCSS(brandingData);
        return brandingData;
      } else {
        setBranding(null);
        resetBrandingCSS();
        return null;
      }
    } catch (err: any) {
      console.error('Erro ao buscar branding por domínio:', err);
      setError(err.message);
      setBranding(null);
      resetBrandingCSS();
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeBranding = async () => {
      // Primeiro tenta por domínio personalizado
      const hostname = window.location.hostname;
      if (hostname && hostname !== 'localhost' && !hostname.includes('lovable.app')) {
        const brandingByDomain = await fetchBrandingByDomain(hostname);
        if (brandingByDomain) return;
      }

      // Depois tenta por instância se fornecida
      if (instancia) {
        await fetchBrandingByInstancia(instancia);
      } else {
        // Sem instância, remove qualquer branding aplicado
        setBranding(null);
        resetBrandingCSS();
      }
    };

    initializeBranding();
  }, [instancia]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      resetBrandingCSS();
    };
  }, []);

  return {
    branding,
    loading,
    error,
    fetchBrandingByInstancia,
    fetchBrandingByDomain,
    resetBranding: resetBrandingCSS
  };
}