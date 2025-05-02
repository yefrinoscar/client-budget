"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBudget } from '@/lib/budget-context';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Summary: React.FC = () => {
  const { 
    budget, 
    getGrandTotal, 
    getTotalHours, 
    getWeeksFromHours, 
    updateBudget 
  } = useBudget();

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    // Solo actualizar si es un número válido o un string vacío (que se convertirá a 0)
    if (!isNaN(value) || e.target.value === '') {
      updateBudget({ hourlyRate: value || 0 });
    }
  };

  const totalHours = getTotalHours();
  const totalWeeks = getWeeksFromHours(totalHours);
  const grandTotal = getGrandTotal();
  const hourlyRate = typeof budget.hourlyRate === 'number' && !isNaN(budget.hourlyRate) ? budget.hourlyRate : 0;

  return (
    <div className="space-y-4">
      <Card className="bg-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Resumen del Presupuesto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="hourlyRate">Tarifa por Hora (USD)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={isNaN(hourlyRate) ? "0" : hourlyRate}
                onChange={handleHourlyRateChange}
                className="mt-1"
              />
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-sm text-muted-foreground">
                Esta tarifa se aplicará a todos los elementos del presupuesto
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 border rounded-md bg-muted/10">
              <p className="font-semibold text-sm">Horas Totales</p>
              <p className="text-2xl font-bold">{isNaN(totalHours) ? 0 : totalHours}</p>
            </div>
            <div className="p-4 border rounded-md bg-muted/10">
              <p className="font-semibold text-sm">Semanas Estimadas</p>
              <p className="text-2xl font-bold">{isNaN(totalWeeks) ? "0.0" : totalWeeks.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">(40 horas/semana)</p>
            </div>
            <div className="p-4 border rounded-md bg-primary/10">
              <p className="font-semibold text-sm">Total del Presupuesto</p>
              <p className="text-2xl font-bold">{isNaN(grandTotal) ? formatCurrency(0) : formatCurrency(grandTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
