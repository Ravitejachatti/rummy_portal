"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'player';
  coins: number;
  gamesPlayed: number;
  gamesWon: number;
  totalEarnings: number;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateUserCoins: (userId: number, newCoins: number) => void;
  updateUserStats: (userId: number, stats: Partial<User>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Initialize demo data
    const demoUsers: User[] = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'admin',
        coins: 10000,
        gamesPlayed: 0,
        gamesWon: 0,
        totalEarnings: 0,
        joinedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Demo Player',
        email: 'player@demo.com',
        password: 'player123',
        role: 'player',
        coins: 1000,
        gamesPlayed: 15,
        gamesWon: 8,
        totalEarnings: 2500,
        joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const savedUsers = localStorage.getItem('rummy-users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      setUsers(demoUsers);
      localStorage.setItem('rummy-users', JSON.stringify(demoUsers));
    }

    // Check for saved session
    const savedUser = localStorage.getItem('rummy-current-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('rummy-current-user', JSON.stringify(foundUser));
      return foundUser;
    }
    throw new Error('Invalid credentials');
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    if (users.some(u => u.email === email)) {
      throw new Error('Email already exists');
    }

    const newUser: User = {
      id: Date.now(),
      name,
      email,
      password,
      role: 'player',
      coins: 1000, // Starting coins
      gamesPlayed: 0,
      gamesWon: 0,
      totalEarnings: 0,
      joinedAt: new Date().toISOString()
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('rummy-users', JSON.stringify(updatedUsers));
    
    setUser(newUser);
    localStorage.setItem('rummy-current-user', JSON.stringify(newUser));
    return newUser;
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('rummy-current-user');
  };

  const updateUserCoins = (userId: number, newCoins: number): void => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, coins: newCoins } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('rummy-users', JSON.stringify(updatedUsers));

    if (user && user.id === userId) {
      const updatedUser = { ...user, coins: newCoins };
      setUser(updatedUser);
      localStorage.setItem('rummy-current-user', JSON.stringify(updatedUser));
    }
  };

  const updateUserStats = (userId: number, stats: Partial<User>): void => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...stats } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('rummy-users', JSON.stringify(updatedUsers));

    if (user && user.id === userId) {
      const updatedUser = { ...user, ...stats };
      setUser(updatedUser);
      localStorage.setItem('rummy-current-user', JSON.stringify(updatedUser));
    }
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    users,
    login,
    register,
    logout,
    updateUserCoins,
    updateUserStats,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};