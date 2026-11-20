import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { signInEmployee, signInCompany, buildEmployeeUser, buildCompanyUser } from '../lib/auth';

const AuthContext = createContext(null);

const SESSION_EMPLOYEE = 'crm_emp_session';
const SESSION_COMPANY  = 'crm_co_session';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider State - User:', user, 'Loading:', loading);

  const resolveUser = async (sessionUser) => {
    if (!sessionUser) return null;

    // Check sessionStorage cache first
    const cachedUser = sessionStorage.getItem(`crm_user_${sessionUser.id}`);
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (_) {}
    }

    let resolved = null;
    try {
      // Fetch both concurrently to optimize login speed
      const [{ data: co }, { data: emp }] = await Promise.all([
        supabase.from('companies').select('*').eq('id', sessionUser.id).maybeSingle(),
        supabase.from('employees').select('*').eq('id', sessionUser.id).maybeSingle(),
      ]);

      if (co) {
        resolved = buildCompanyUser(co);
      } else if (emp) {
        resolved = buildEmployeeUser(emp);
      }
    } catch (err) {
      console.error('Error resolving user from DB:', err);
    }

    if (!resolved) {
      // 3. Fallback using user metadata directly
      const meta = sessionUser.user_metadata || {};
      if (meta.is_hr) {
        resolved = {
          id: sessionUser.id,
          email: sessionUser.email,
          user_metadata: { full_name: meta.company_name || meta.full_name },
          role: 'admin',
          company_id: sessionUser.id,
          company_name: meta.company_name || 'Company',
          company_code: meta.company_code || '',
          default_revenue_pct: 2.0,
          default_commission_pct: 0.5,
          is_hr: true,
          isEmployee: false,
        };
      } else {
        resolved = {
          id: sessionUser.id,
          email: sessionUser.email,
          user_metadata: { full_name: meta.full_name },
          role: meta.role || 'employee',
          phone: meta.phone,
          company_id: meta.company_id,
          is_hr: false,
          isEmployee: true,
        };
      }
    }

    if (resolved) {
      sessionStorage.setItem(`crm_user_${sessionUser.id}`, JSON.stringify(resolved));
    }

    return resolved;
  };

  useEffect(() => {
    let active = true;

    // Timeout fallback: force loader to hide after 2.5 seconds
    const timer = setTimeout(() => {
      if (active) {
        console.warn('Auth loading timed out. Forcing loading to false.');
        setLoading(false);
      }
    }, 2500);

    const initAuth = async () => {
      try {
        console.log('initAuth: getting session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('initAuth: session fetched:', session);
        if (session && active) {
          const fullUser = await resolveUser(session.user);
          console.log('initAuth: user resolved:', fullUser);
          setUser(fullUser);
        }
      } catch (err) {
        console.error('Error in initAuth:', err);
      } finally {
        if (active) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      try {
        console.log('onAuthStateChange fired:', _e, session);
        if (session && active) {
          const fullUser = await resolveUser(session.user);
          setUser(fullUser);
        } else if (active) {
          setUser(null);
        }
      } catch (err) {
        console.error('Error in onAuthStateChange:', err);
      } finally {
        if (active) {
          setLoading(false);
          clearTimeout(timer);
        }
      }
    });

    return () => {
      active = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    // Simply use Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.toLowerCase().trim(), 
      password 
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
