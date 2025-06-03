"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBudget } from '@/lib/budget-context';
import { CompanyInfo as CompanyInfoType, DEFAULT_COMPANY_INFO } from '@/lib/types';
import { Building2 } from 'lucide-react';

export const CompanyInfo: React.FC = () => {
  const { budget, updateCompanyInfo } = useBudget();
  const companyInfo: CompanyInfoType = { ...DEFAULT_COMPANY_INFO, ...budget.companyInfo };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateCompanyInfo({ [name]: value });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          Información de la Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Nombre de la Empresa *</Label>
            <Input
              id="companyName"
              name="name"
              placeholder="Ej: Mi Empresa S.A.C."
              value={companyInfo.name}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="taxId">RUC / Tax ID</Label>
            <Input
              id="taxId"
              name="taxId"
              placeholder="Ej: 20123456789"
              value={companyInfo.taxId || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="address">Dirección</Label>
          <Textarea
            id="address"
            name="address"
            placeholder="Ej: Av. Principal 123, Lima, Perú"
            value={companyInfo.address || ''}
            onChange={handleChange}
            rows={2}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="companyPhone">Teléfono</Label>
            <Input
              id="companyPhone"
              name="phone"
              type="tel"
              placeholder="Ej: +51 999 888 777"
              value={companyInfo.phone || ''}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyEmail">Email</Label>
            <Input
              id="companyEmail"
              name="email"
              type="email"
              placeholder="Ej: contacto@empresa.com"
              value={companyInfo.email || ''}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="Ej: www.empresa.com"
              value={companyInfo.website || ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 