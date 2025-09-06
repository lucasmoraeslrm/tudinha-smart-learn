import React from 'react';
import { useParams } from 'react-router-dom';
import { useSchoolBranding } from '@/hooks/useSchoolBranding';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import StudentLoginForm from '@/components/StudentLoginForm';
interface StudentLoginProps {
  onBack?: () => void;
}
export default function StudentLogin({ onBack }: StudentLoginProps) {
  const { instancia } = useParams();
  const { branding } = useSchoolBranding(instancia);
  const primaryColor = branding?.cor_primaria || '#3B82F6';
  const secondaryColor = branding?.cor_secundaria || '#1E40AF';

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack} 
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        
        <div className="w-full max-w-md">
          <StudentLoginForm onBack={onBack} showMobileLogo={true} />
        </div>
      </div>

      {/* Right Side - Image/Gradient */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          background: branding?.login_image_url 
            ? `linear-gradient(135deg, ${primaryColor}AA, ${secondaryColor}AA), url(${branding.login_image_url})`
            : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: branding?.login_image_url ? 'overlay' : 'normal'
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            {branding?.logo_url ? (
              <img 
                src={branding.logo_url} 
                alt={branding.nome}
                className="mx-auto h-24 w-auto mb-8 filter brightness-0 invert"
              />
            ) : (
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <GraduationCap className="w-16 h-16 text-white" />
              </div>
            )}
            <h1 className="text-5xl font-bold mb-6">
              {branding?.nome || "Portal Educacional"}
            </h1>
            <p className="text-2xl opacity-90">
              Sistema de Gestão Educacional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}