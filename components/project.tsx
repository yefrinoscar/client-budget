"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectItem } from './project-item';
import { useBudget } from '@/lib/budget-context';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

interface ProjectProps {
  projectId: string;
}

export const Project: React.FC<ProjectProps> = ({ projectId }) => {
  const { 
    budget, 
    updateProject, 
    removeProject, 
    addBudgetItem, 
    getProjectTotal, 
    getProjectHours, 
    getWeeksFromHours 
  } = useBudget();
  
  const project = budget.projects.find(p => p.id === projectId);
  const [isEditing, setIsEditing] = useState(false);
  const [projectName, setProjectName] = useState('');
  
  useEffect(() => {
    if (project) {
      setProjectName(project.name || '');
    }
  }, [project]);
  
  if (!project) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectName(e.target.value);
  };

  const handleNameBlur = () => {
    if (projectName.trim() !== '') {
      updateProject(projectId, projectName);
    } else {
      setProjectName(project.name || '');
    }
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    }
  };

  const projectHours = getProjectHours(projectId);
  const projectWeeks = getWeeksFromHours(projectHours);
  const projectTotal = getProjectTotal(projectId);

  return (
    <Card className="mb-6 overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex-1" onClick={() => setIsEditing(true)}>
          {isEditing ? (
            <Input
              value={projectName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="text-xl font-semibold"
            />
          ) : (
            <CardTitle className="text-xl cursor-pointer hover:text-primary transition-colors">
              {project.name || 'Nuevo Proyecto'}
            </CardTitle>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => removeProject(projectId)}
          className="ml-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3 p-2 border-b mb-2">
            <div className="flex-1 min-w-[200px] font-medium text-sm">Descripción</div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-right font-medium text-sm">Horas</div>
              <div className="w-20 text-right font-medium text-sm">Semanas</div>
              <div className="w-28 text-right font-medium text-sm">Total</div>
              <div className="w-8"></div>
            </div>
          </div>
          
          {project.items && project.items.length > 0 ? (
            <div className="space-y-2">
              {project.items.map(item => (
                <ProjectItem 
                  key={item.id} 
                  projectId={projectId} 
                  itemId={item.id} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No hay elementos todavía. Añade tu primer elemento.
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => addBudgetItem(projectId)}
            className="w-full mt-4 text-primary hover:bg-primary/10"
          >
            <Plus className="h-4 w-4 mr-2" /> Añadir Elemento
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t bg-muted/5">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mb-2 sm:mb-0">
          <div>
            <span className="text-sm text-muted-foreground">Horas:</span>
            <span className="ml-2 font-medium">{isNaN(projectHours) ? 0 : projectHours}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Semanas:</span>
            <span className="ml-2 font-medium">{isNaN(projectWeeks) ? "0.0" : projectWeeks.toFixed(1)}</span>
          </div>
        </div>
        <div className="font-bold text-lg">
          <span className="text-sm text-muted-foreground mr-2">Total:</span>
          {isNaN(projectTotal) ? formatCurrency(0) : formatCurrency(projectTotal)}
        </div>
      </CardFooter>
    </Card>
  );
};
