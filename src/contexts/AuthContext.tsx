import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: 'admin' | 'student' | 'school_admin' | 'coordinator';
  created_at: string;
  updated_at: string;
}

interface StudentSession {
  id: string;
  codigo: string;
  name: string;
  full_name?: string;
  ano_letivo?: string;
  turma?: string;
  role: 'student';
  sessionToken: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  studentSession: StudentSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'student' | 'school_admin' | 'coordinator', codigo?: string, anoLetivo?: string, turma?: string) => Promise<{ error: any }>;
  signInStudent: (codigo: string, password: string) => Promise<{ error: any }>;
  signUpStudent: (codigo: string, password: string, name: string, anoLetivo?: string, turma?: string, age?: number) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isSchoolAdmin: boolean;
  isStudent: boolean;
  getStudentId: () => string | null;
  getStudentName: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentSession, setStudentSession] = useState<StudentSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing student session in localStorage
    const checkStudentSession = async () => {
      const storedSession = localStorage.getItem('student_session');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          // Verify session with backend
          const response = await fetch(`https://pwdkfekouyyujfwmgqls.supabase.co/functions/v1/student-auth?action=verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${sessionData.sessionToken}`,
              'Content-Type': 'application/json'
            }
          });
          const responseData = await response.json();

          if (responseData?.success) {
            setStudentSession({
              ...responseData.student,
              sessionToken: sessionData.sessionToken
            });
          } else {
            localStorage.removeItem('student_session');
          }
        } catch (error) {
          localStorage.removeItem('student_session');
        }
      }
      setLoading(false);
    };

    // Set up auth state listener for admin users
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Clear student session when admin logs in
          setStudentSession(null);
          localStorage.removeItem('student_session');
          
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            setProfile(profileData as Profile);
          }, 0);
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setStudentSession(null);
          localStorage.removeItem('student_session');
          setLoading(false);
        }
      }
    );

    // Check for existing admin session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profileData }) => {
            setProfile(profileData as Profile);
            setLoading(false);
          });
      } else {
        // Check for student session if no admin session
        checkStudentSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (emailOrCode: string, password: string) => {
    // Se não contém @, assume que é um código e converte para email
    const email = emailOrCode.includes('@') ? emailOrCode : `${emailOrCode}@estudante.local`;
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'student' | 'school_admin' | 'coordinator', codigo?: string, anoLetivo?: string, turma?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          codigo: codigo,
          ano_letivo: anoLetivo,
          turma: turma
        }
      }
    });
    return { error };
  };

  const signInStudent = async (codigo: string, password: string) => {
    try {
      const response = await fetch(`https://pwdkfekouyyujfwmgqls.supabase.co/functions/v1/student-auth?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo, password })
      });

      const data = await response.json();

      if (data.success) {
        const sessionData = {
          ...data.student,
          sessionToken: data.sessionToken
        };
        
        setStudentSession(sessionData);
        localStorage.setItem('student_session', JSON.stringify(sessionData));
        
        // Clear admin session
        setUser(null);
        setSession(null);
        setProfile(null);
        
        return { error: null };
      } else {
        return { error: data.error || 'Erro ao fazer login' };
      }
    } catch (error) {
      console.error('Erro no login do estudante:', error);
      return { error: 'Erro de conexão' };
    }
  };

  const signUpStudent = async (codigo: string, password: string, name: string, anoLetivo?: string, turma?: string, age?: number) => {
    try {
      const response = await fetch(`https://pwdkfekouyyujfwmgqls.supabase.co/functions/v1/student-auth?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigo, password, name, anoLetivo, turma, age })
      });

      const data = await response.json();

      if (data.success) {
        return { error: null };
      } else {
        return { error: data.error || 'Erro ao criar estudante' };
      }
    } catch (error) {
      console.error('Erro ao criar estudante:', error);
      return { error: 'Erro de conexão' };
    }
  };

  const signOut = async () => {
    // Sign out admin
    await supabase.auth.signOut();
    
    // Clear student session
    setStudentSession(null);
    localStorage.removeItem('student_session');
  };

  const getStudentId = () => {
    if (studentSession) {
      return studentSession.id;
    }
    // Fallback to localStorage for backward compatibility
    const storedId = localStorage.getItem('tudinha_student_id');
    return storedId;
  };

  const getStudentName = () => {
    if (studentSession) {
      return studentSession.full_name || studentSession.name;
    }
    // Fallback to localStorage for backward compatibility
    const storedName = localStorage.getItem('tudinha_student_name');
    return storedName;
  };

  const value = {
    user,
    session,
    profile,
    studentSession,
    loading,
    signIn,
    signUp,
    signInStudent,
    signUpStudent,
    signOut,
    isAdmin: profile?.role === 'admin',
    isSchoolAdmin: ['school_admin', 'coordinator'].includes(profile?.role || ''),
    isStudent: studentSession?.role === 'student' || profile?.role === 'student',
    getStudentId,
    getStudentName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}