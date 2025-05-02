"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useBudget } from '@/lib/budget-context';

export const Terms: React.FC = () => {
  const { budget, updateTerms } = useBudget();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTerms(e.target.value);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Términos y Condiciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <Label htmlFor="terms">Términos de Pago e Información Adicional</Label>
          <Textarea
            id="terms"
            placeholder="Ingrese términos de pago e información adicional"
            value={budget.terms}
            onChange={handleChange}
            rows={6}
          />
        </div>
      </CardContent>
    </Card>
  );
};
