"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { useBudget } from '@/lib/budget-context';

// Estilos CSS para eliminar las flechas de los inputs numéricos
const noArrowsStyle = `
  .no-arrows::-webkit-outer-spin-button,
  .no-arrows::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .no-arrows {
    -moz-appearance: textfield;
  }
`;

interface ProjectItemProps {
  projectId: string;
  itemId: string;
}

export const ProjectItem: React.FC<ProjectItemProps> = ({ projectId, itemId }) => {
  const { budget, updateBudgetItem, removeBudgetItem, getWeeksFromHours } = useBudget();
  
  const project = budget.projects.find(p => p.id === projectId);
  const item = project?.items.find(i => i.id === itemId);
  
  if (!project || !item) return null;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'hours') {
      const parsedValue = parseFloat(value);
      // Solo actualizar si es un número válido o un string vacío (que se convertirá a 0)
      if (!isNaN(parsedValue) || value === '') {
        updateBudgetItem(projectId, itemId, { [name]: parsedValue || 0 });
      }
    } else {
      updateBudgetItem(projectId, itemId, { [name]: value });
    }
  };

  // Asegurarse de que item.hours es un número válido
  const hours = typeof item.hours === 'number' && !isNaN(item.hours) ? item.hours : 0;
  const hourlyRate = typeof budget.hourlyRate === 'number' && !isNaN(budget.hourlyRate) ? budget.hourlyRate : 0;
  const itemTotal = hours * hourlyRate;
  const weeks = getWeeksFromHours(hours);

  return (
    <>
      <style>{noArrowsStyle}</style>
      <div className="flex flex-wrap items-center gap-3 p-2 hover:bg-muted/10 group">
        <div className="flex-1 min-w-[200px]">
          <Input
            name="description"
            placeholder="Descripción del ítem"
            value={item.description || ''}
            onChange={handleChange}
            className="w-full border rounded-md focus-visible:ring-1 px-2 h-10"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20">
            <Input
              name="hours"
              type="number"
              min="0"
              step="0.5"
              placeholder="Horas"
              value={isNaN(hours) ? "0" : hours.toString()}
              onChange={handleChange}
              className="w-full text-right border rounded-md focus-visible:ring-1 px-2 h-10 no-arrows"
            />
          </div>
          <div className="w-20 text-right px-2 h-10 flex items-center justify-end border rounded-md">
            {isNaN(weeks) ? "0.0" : weeks.toFixed(1)}
          </div>
          <div className="w-28 text-right px-2 h-10 flex items-center justify-end font-medium border rounded-md">
            {isNaN(itemTotal) ? formatCurrency(0) : formatCurrency(itemTotal)}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => removeBudgetItem(projectId, itemId)}
            className="text-destructive hover:text-destructive/90 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
