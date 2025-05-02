"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useBudget } from '@/lib/budget-context';

export const ClientInfo: React.FC = () => {
  const { budget, updateClientInfo } = useBudget();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'clientName') {
      updateClientInfo(value, budget.clientEmail);
    } else if (name === 'clientEmail') {
      updateClientInfo(budget.clientName, value);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Información del Cliente</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="clientName">Nombre del Cliente</Label>
          <Input
            id="clientName"
            name="clientName"
            placeholder="Ingrese el nombre del cliente"
            value={budget.clientName}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="clientEmail">Correo Electrónico del Cliente</Label>
          <Input
            id="clientEmail"
            name="clientEmail"
            type="email"
            placeholder="Ingrese el correo electrónico del cliente"
            value={budget.clientEmail}
            onChange={handleChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};
