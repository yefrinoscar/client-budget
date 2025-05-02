"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ClientInfo } from '@/components/client-info';
import { Project } from '@/components/project';
import { Terms } from '@/components/terms';
import { Summary } from '@/components/summary';
import { PdfExport } from '@/components/pdf-export';
import { useBudget } from '@/lib/budget-context';
import { Plus } from 'lucide-react';

const BudgetApp: React.FC = () => {
  const { budget, addProject } = useBudget();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Presupuesto para Cliente</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClientInfo />
          
          <div className="space-y-4">
            {budget.projects.map(project => (
              <Project key={project.id} projectId={project.id} />
            ))}
            
            <Button 
              onClick={addProject}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Añadir Proyecto
            </Button>
          </div>
          
          <Terms />
        </div>
        
        <div className="space-y-6">
          <Summary />
          <PdfExport />
        </div>
      </div>
    </div>
  );
};

export default BudgetApp;
