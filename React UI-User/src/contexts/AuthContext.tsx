import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  createUser as apiCreateUser, 
  getUserByEmail as apiGetUserByEmail, 
  updateUserProfile as apiUpdateUserProfile 
} from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'user' | 'admin' = 'user') => {
    try {
      const backendUser = await apiGetUserByEmail(email);
      const uiUser: User = {
        id: String(backendUser.id),
        name: backendUser.name,
        email: backendUser.email,
        phone: backendUser.phone,
        role,
        dateOfBirth: backendUser.dateOfBirth,
        gender: backendUser.gender,
        address: backendUser.address,
      };
      setUser(uiUser);
      localStorage.setItem('user', JSON.stringify(uiUser));
      toast.success('Login successful!');
    } catch (e) {
      toast.error('Invalid credentials or user not found');
      throw e;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // Backend requires full profile; use minimal sensible defaults
    const today = new Date().toISOString().slice(0, 10);
    await apiCreateUser({
      name,
      email,
      phone: '+910000000000',
      address: 'Address not provided',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      panCard: 'AAAAA0000A',
      aadhar: '000000000000',
      joinedDate: today,
      kycStatus: 'pending',
      profileImage: null
    });
    // Fetch created user to populate session
    const backendUser = await apiGetUserByEmail(email);
    const uiUser: User = {
      id: String(backendUser.id),
      name: backendUser.name,
      email: backendUser.email,
      phone: backendUser.phone,
      role: 'user',
      dateOfBirth: backendUser.dateOfBirth,
      gender: backendUser.gender,
      address: backendUser.address,
    };
    setUser(uiUser);
    localStorage.setItem('user', JSON.stringify(uiUser));
    toast.success('Registration successful!');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    const userId = Number(user.id);
    await apiUpdateUserProfile(userId, {
      name: userData.name,
      phone: userData.phone,
      address: userData.address
    });
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading,
        login, 
        logout, 
        register,
        updateUser
      }}
    >
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
