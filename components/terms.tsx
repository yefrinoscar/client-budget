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
          <p className="text-sm text-muted-foreground mb-2">
            Esta sección es opcional. Solo aparecerá en la vista previa si añades contenido.
          </p>
          <Textarea
            id="terms"
            placeholder="Ejemplo:
- Tiempo estimado de desarrollo: 6 a 8 semanas
- Forma de pago: 40% anticipo, 30% intermedio, 30% a la entrega
- Soporte post-lanzamiento: Opcional con costo adicional
- Garantía: 30 días después de la entrega"
            value={budget.terms}
            onChange={handleChange}
            rows={8}
          />
        </div>
      </CardContent>
    </Card>
  );
};
