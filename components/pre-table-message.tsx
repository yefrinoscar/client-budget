"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/rich-text-editor';
import { useBudget } from '@/lib/budget-context';
import { MessageSquare } from 'lucide-react';

export const PreTableMessage: React.FC = () => {
  const { budget, updatePreTableMessage } = useBudget();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Mensaje antes de la tabla de precios
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Agregue un mensaje personalizado que aparecerá antes de los detalles de precios en el presupuesto.
        </p>
      </CardHeader>
      <CardContent>
        <RichTextEditor
          value={budget.preTableMessage || ''}
          onChange={updatePreTableMessage}
          placeholder="Escriba un mensaje personalizado que aparecerá antes de la tabla de precios. Puede usar formato como **negrita**, *cursiva*, listas, etc."
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}; 