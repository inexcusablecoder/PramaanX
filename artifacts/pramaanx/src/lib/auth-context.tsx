import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  companyId: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  size: string;
  industry: string;
  businessType: string;
  departments: string;
  branches: string;
  capacity: number;
  verificationStatus: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (companyData: Record<string, any>, adminData: Record<string, any>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('px_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [company, setCompany] = useState<Company | null>(() => {
    const saved = localStorage.getItem('px_company');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('px_user', JSON.stringify(user));
    else localStorage.removeItem('px_user');
  }, [user]);

  useEffect(() => {
    if (company) localStorage.setItem('px_company', JSON.stringify(company));
    else localStorage.removeItem('px_company');
  }, [company]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setCompany(data.company || null);
        if (data.token) localStorage.setItem('px_token', data.token);
        return true;
      }
      return false;
    } catch (_err) {
      // Offline fallback login for demo
      const demoUser: User = {
        id: 'user-demo-01',
        name: 'Ari Raghavan',
        email: email || 'ari@pramaanx.io',
        role: 'CEO / Executive',
        department: 'Operations',
        companyId: 'comp-demo-01',
      };
      const demoComp: Company = {
        id: 'comp-demo-01',
        name: 'Acme Cybernetics Ltd.',
        email: email || 'admin@acmecybernetics.com',
        size: '51-200 Employees',
        industry: 'IT & Software',
        businessType: 'Software Development',
        departments: 'HR, Operations, Engineering',
        branches: 'Headquarters',
        capacity: 250,
        verificationStatus: 'verified',
      };
      setUser(demoUser);
      setCompany(demoComp);
      return true;
    }
  };

  const register = async (companyData: Record<string, any>, adminData: Record<string, any>): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...companyData, ...adminData }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setCompany(data.company || null);
        if (data.token) localStorage.setItem('px_token', data.token);
        return true;
      }
      return false;
    } catch (_err) {
      // Offline fallback for demo registration
      const newComp: Company = {
        id: `comp-${Date.now()}`,
        name: companyData.companyName || 'Registered Enterprise',
        email: companyData.companyEmail || 'admin@enterprise.com',
        size: companyData.companySize || '51-200 Employees',
        industry: companyData.industry || 'IT & Software',
        businessType: companyData.businessType || 'Software Development',
        departments: Array.isArray(companyData.departments) ? companyData.departments.join(', ') : 'HR, Engineering',
        branches: companyData.branches || 'Headquarters',
        capacity: Number(companyData.capacity) || 100,
        verificationStatus: 'verified',
      };
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: adminData.adminName || 'Admin User',
        email: adminData.adminEmail || companyData.companyEmail || 'admin@enterprise.com',
        role: adminData.adminRole || 'CEO / Executive',
        department: adminData.adminDept || 'Operations',
        companyId: newComp.id,
      };
      setUser(newUser);
      setCompany(newComp);
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('px_token');
    localStorage.removeItem('px_user');
    localStorage.removeItem('px_company');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
