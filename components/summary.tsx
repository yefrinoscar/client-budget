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
    getSubtotal,
    getIGV,
    getTotalWithIGV,
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
  const subtotal = getSubtotal();
  const igv = getIGV();
  const totalWithIGV = getTotalWithIGV();
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="p-4 border rounded-md bg-muted/10">
              <p className="font-semibold text-sm">Semanas Estimadas</p>
              <p className="text-2xl font-bold">{isNaN(totalWeeks) ? "0.0" : totalWeeks.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">(40 horas/semana)</p>
            </div>
            <div className="p-4 border rounded-md bg-muted/10">
              <p className="font-semibold text-sm">Horas Totales</p>
              <p className="text-2xl font-bold">{isNaN(totalHours) ? 0 : totalHours}</p>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center p-4 border rounded-md bg-muted/10">
              <span className="font-semibold">Subtotal:</span>
              <span className="text-lg font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-md bg-orange-50">
              <span className="font-semibold">IGV (18%):</span>
              <span className="text-lg font-bold text-orange-600">{formatCurrency(igv)}</span>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-md bg-primary/10">
              <span className="font-semibold text-lg">Total:</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(totalWithIGV)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
