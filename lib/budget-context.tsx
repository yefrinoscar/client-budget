"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Budget, Project, BudgetItem, DEFAULT_TERMS, CompanyInfo, DEFAULT_COMPANY_INFO, DEFAULT_PAYMENT_TERMS, DEFAULT_SUPPORT_TERMS, DEFAULT_TIME_ESTIMATE, DEFAULT_PROJECT_NOTE } from './types';
import { generateUniqueId } from './utils';

interface BudgetContextType {
  budget: Budget;
  addProject: () => void;
  updateProject: (projectId: string, name: string) => void;
  removeProject: (projectId: string) => void;
  addBudgetItem: (projectId: string) => void;
  updateBudgetItem: (projectId: string, itemId: string, item: Partial<BudgetItem>) => void;
  removeBudgetItem: (projectId: string, itemId: string) => void;
  updateClientInfo: (name: string, email: string, phone?: string) => void;
  updateCompanyInfo: (companyInfo: Partial<CompanyInfo>) => void;
  updateTerms: (terms: string) => void;
  updatePaymentTerms: (paymentTerms: string) => void;
  updateSupportTerms: (supportTerms: string) => void;
  updateTimeEstimate: (timeEstimate: string) => void;
  updateProjectNote: (projectNote: string) => void;
  updateHourlyRate: (rate: number) => void;
  updatePreTableMessage: (message: string) => void;
  updateIgvEnabled: (enabled: boolean) => void;
  getProjectTotal: (projectId: string) => number;
  getGrandTotal: () => number;
  getSubtotal: () => number;
  getIGV: () => number;
  getTotalWithIGV: () => number;
  getProjectHours: (projectId: string) => number;
  getTotalHours: () => number;
  getWeeksFromHours: (hours: number) => number;
  updateBudget: (updates: Partial<Budget>) => void;
}

const defaultBudget: Budget = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  date: '', // FIXED: Always deterministic for SSR/CSR
  projects: [],
  terms: DEFAULT_TERMS,
  paymentTerms: DEFAULT_PAYMENT_TERMS,
  supportTerms: DEFAULT_SUPPORT_TERMS,
  timeEstimate: DEFAULT_TIME_ESTIMATE,
  projectNote: DEFAULT_PROJECT_NOTE,
  hourlyRate: 15,
  companyInfo: DEFAULT_COMPANY_INFO,
  preTableMessage: '',
  igvEnabled: true, // IGV enabled by default (18% tax)
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
  }, [budget.date]);

  const addProject = () => {
    const newProject: Project = {
      id: generateUniqueId(),
      name: 'New Project',
      items: [],
      totalHours: 0,
      totalAmount: 0, 
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
      weeks: 0, 
      itemTotal: 0,
      pricingMode: 'hourly', // Default to hourly pricing
      fixedPrice: 0,
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

  const updateClientInfo = (clientName: string, clientEmail: string, clientPhone?: string) => {
    setBudget(prev => ({
      ...prev,
      clientName,
      clientEmail,
      clientPhone: clientPhone || '',
    }));
  };

  const updateCompanyInfo = (companyInfo: Partial<CompanyInfo>) => {
    setBudget(prev => ({
      ...prev,
      companyInfo: {
        ...DEFAULT_COMPANY_INFO,
        ...prev.companyInfo,
        ...companyInfo
      }
    }));
  };

  const updateTerms = (terms: string) => {
    setBudget(prev => ({
      ...prev,
      terms,
    }));
  };

  const updatePaymentTerms = (paymentTerms: string) => {
    setBudget(prev => ({
      ...prev,
      paymentTerms,
    }));
  };

  const updateSupportTerms = (supportTerms: string) => {
    setBudget(prev => ({
      ...prev,
      supportTerms,
    }));
  };

  const updateTimeEstimate = (timeEstimate: string) => {
    setBudget(prev => ({
      ...prev,
      timeEstimate,
    }));
  };

  const updateProjectNote = (projectNote: string) => {
    setBudget(prev => ({
      ...prev,
      projectNote,
    }));
  };

  const updateHourlyRate = (hourlyRate: number) => {
    setBudget(prev => ({
      ...prev,
      hourlyRate,
    }));
  };

  const updatePreTableMessage = (message: string) => {
    setBudget(prev => ({
      ...prev,
      preTableMessage: message,
    }));
  };

  const updateIgvEnabled = (enabled: boolean) => {
    setBudget(prev => ({
      ...prev,
      igvEnabled: enabled,
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
      // Use fixed price if pricing mode is 'fixed', otherwise calculate by hours
      if (item.pricingMode === 'fixed') {
        const fixedPrice = typeof item.fixedPrice === 'number' && !isNaN(item.fixedPrice) ? item.fixedPrice : 0;
        return total + fixedPrice;
      } else {
        const hours = typeof item.hours === 'number' && !isNaN(item.hours) ? item.hours : 0;
        return total + (hours * hourlyRate);
      }
    }, 0);
  };

  const getGrandTotal = (): number => {
    return budget.projects.reduce((total, project) => {
      return total + getProjectTotal(project.id);
    }, 0);
  };

  const getSubtotal = (): number => {
    return budget.projects.reduce((total, project) => {
      return total + getProjectTotal(project.id);
    }, 0);
  };

  const getIGV = (): number => {
    if (!budget.igvEnabled) return 0;
    return getSubtotal() * 0.18;
  };

  const getTotalWithIGV = (): number => {
    return getSubtotal() + getIGV();
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
      updateCompanyInfo,
      updateTerms,
      updatePaymentTerms,
      updateSupportTerms,
      updateTimeEstimate,
      updateProjectNote,
      updateHourlyRate,
      updatePreTableMessage,
      updateIgvEnabled,
      getProjectTotal,
      getGrandTotal,
      getSubtotal,
      getIGV,
      getTotalWithIGV,
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
