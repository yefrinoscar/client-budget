"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Budget, Project, BudgetItem, DEFAULT_TERMS } from './types';
import { generateUniqueId } from './utils';

interface BudgetContextType {
  budget: Budget;
  addProject: () => void;
  updateProject: (projectId: string, name: string) => void;
  removeProject: (projectId: string) => void;
  addBudgetItem: (projectId: string) => void;
  updateBudgetItem: (projectId: string, itemId: string, item: Partial<BudgetItem>) => void;
  removeBudgetItem: (projectId: string, itemId: string) => void;
  updateClientInfo: (name: string, email: string) => void;
  updateTerms: (terms: string) => void;
  updateHourlyRate: (rate: number) => void;
  getProjectTotal: (projectId: string) => number;
  getGrandTotal: () => number;
  getProjectHours: (projectId: string) => number;
  getTotalHours: () => number;
  getWeeksFromHours: (hours: number) => number;
  updateBudget: (updates: Partial<Budget>) => void;
}

const defaultBudget: Budget = {
  clientName: '',
  clientEmail: '',
  date: '', // FIXED: Always deterministic for SSR/CSR
  projects: [],
  terms: DEFAULT_TERMS,
  hourlyRate: 15,
};

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budget, setBudget] = useState<Budget>(defaultBudget);

  // Load saved budget from localStorage on client after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('budget');
      if (saved) {
        try {
          setBudget(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved budget', e);
        }
      }
    }
  }, []);

  // Persist budget to localStorage on every change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('budget', JSON.stringify(budget));
    }
  }, [budget]);

  // Set the date on the client after mount
  useEffect(() => {
    if (!budget.date) {
      setBudget(prev => ({ ...prev, date: new Date().toISOString() }));
    }
  }, []);

  const addProject = () => {
    const newProject: Project = {
      id: generateUniqueId(),
      name: 'New Project',
      items: [],
    };
    setBudget(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const updateProject = (projectId: string, name: string) => {
    setBudget(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === projectId ? { ...project, name } : project
      ),
    }));
  };

  const removeProject = (projectId: string) => {
    setBudget(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== projectId),
    }));
  };

  const addBudgetItem = (projectId: string) => {
    const newItem: BudgetItem = {
      id: generateUniqueId(),
      description: '',
      hours: 0,  
      unitPrice: budget.hourlyRate || 0,  
    };
    setBudget(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === projectId 
          ? { ...project, items: [...project.items, newItem] } 
          : project
      ),
    }));
  };

  const updateBudgetItem = (projectId: string, itemId: string, updates: Partial<BudgetItem>) => {
    setBudget(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === projectId 
          ? { 
              ...project, 
              items: project.items.map(item => 
                item.id === itemId ? { ...item, ...updates } : item
              ) 
            } 
          : project
      ),
    }));
  };

  const removeBudgetItem = (projectId: string, itemId: string) => {
    setBudget(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === projectId 
          ? { ...project, items: project.items.filter(item => item.id !== itemId) } 
          : project
      ),
    }));
  };

  const updateClientInfo = (clientName: string, clientEmail: string) => {
    setBudget(prev => ({
      ...prev,
      clientName,
      clientEmail,
    }));
  };

  const updateTerms = (terms: string) => {
    setBudget(prev => ({
      ...prev,
      terms,
    }));
  };

  const updateHourlyRate = (hourlyRate: number) => {
    setBudget(prev => ({
      ...prev,
      hourlyRate,
    }));
  };

  const getProjectHours = (projectId: string): number => {
    const project = budget.projects.find(p => p.id === projectId);
    if (!project) return 0;
    
    return project.items.reduce((total, item) => {
      const hours = typeof item.hours === 'number' && !isNaN(item.hours) ? item.hours : 0;
      return total + hours;
    }, 0);
  };

  const getTotalHours = (): number => {
    return budget.projects.reduce((total, project) => {
      return total + getProjectHours(project.id);
    }, 0);
  };

  const getWeeksFromHours = (hours: number): number => {
    // Asegurarse de que hours es un número válido
    if (typeof hours !== 'number' || isNaN(hours)) return 0;
    return hours / 40;
  };

  const getProjectTotal = (projectId: string): number => {
    const project = budget.projects.find(p => p.id === projectId);
    if (!project) return 0;
    
    const hourlyRate = typeof budget.hourlyRate === 'number' && !isNaN(budget.hourlyRate) ? budget.hourlyRate : 0;
    
    return project.items.reduce((total, item) => {
      const hours = typeof item.hours === 'number' && !isNaN(item.hours) ? item.hours : 0;
      return total + (hours * hourlyRate);
    }, 0);
  };

  const getGrandTotal = (): number => {
    return budget.projects.reduce((total, project) => {
      return total + getProjectTotal(project.id);
    }, 0);
  };

  const updateBudget = (updates: Partial<Budget>) => {
    setBudget(prev => ({
      ...prev,
      ...updates
    }));
  };

  return (
    <BudgetContext.Provider value={{
      budget,
      addProject,
      updateProject,
      removeProject,
      addBudgetItem,
      updateBudgetItem,
      removeBudgetItem,
      updateClientInfo,
      updateTerms,
      updateHourlyRate,
      getProjectTotal,
      getGrandTotal,
      getProjectHours,
      getTotalHours,
      getWeeksFromHours,
      updateBudget
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = (): BudgetContextType => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
