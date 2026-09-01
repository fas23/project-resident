import { createContext, useContext, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * Carga el perfil y el rol del usuario
   */
  const loadUserData = async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      setRole(null);
      return;
    }

    try {
      // Perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error cargando profile:", profileError);
      }

      setProfile(profileData || null);

      // Rol
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .maybeSingle();

      if (roleError) {
        console.error("Error cargando role:", roleError);
      }

      setRole(roleData?.role || null);
    } catch (error) {
      console.error("Error cargando datos del usuario:", error);

      setProfile(null);
      setRole(null);
    }
  };

  /*
   * LOGIN
   */
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    setSession(data.session);
    setUser(data.user);

    await loadUserData(data.user);

    return data;
  };

  /*
   * LOGOUT
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  /*
   * Sesión inicial
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        const currentSession = data.session;

        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          await loadUserData(currentSession.user);
        }
      } catch (error) {
        console.error("Error inicializando autenticación:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    /*
     * Escuchar cambios de autenticación
     */
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) {
          return;
        }

        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await loadUserData(newSession.user);
        } else {
          setProfile(null);
          setRole(null);
        }
      },
    );

    return () => {
      mounted = false;

      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    role,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
}
