export interface BudgetItem {
  id: string;
  description: string;
  hours: number;
  unitPrice: number;
  weeks: number;
  itemTotal: number;
  pricingMode?: 'hourly' | 'fixed'; // 'hourly' for hours * rate, 'fixed' for direct price
  fixedPrice?: number; // Direct price when using fixed pricing
}

export interface Project {
  totalHours: number;
  totalAmount: number;
  id: string;
  name: string;
  items: BudgetItem[];
}

export interface CompanyInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string; // RUC or Tax ID
}

export interface Budget {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;
  projects: Project[];
  terms: string;
  hourlyRate: number;
  subtotal?: number;
  igv?: number;
  total?: number;
  paymentTerms?: string; // New field for editable payment terms
  supportTerms?: string; // New field for editable support terms
  timeEstimate?: string; // New field for editable time estimate
  projectNote?: string; // New field for editable project note
  companyInfo?: CompanyInfo;
  preTableMessage?: string; // Rich text message before the price table
  igvEnabled?: boolean; // Controls whether IGV (18% tax) is applied
}

export const DEFAULT_TERMS = `- Tiempo estimado de desarrollo: 6 a 8 semanas
- Forma de pago: 40% anticipo, 30% intermedio, 30% a la entrega
- Soporte post-lanzamiento: Opcional con costo adicional`;

export const DEFAULT_PAYMENT_TERMS = `El resto del pago se distribuirá por etapas según el avance del proyecto.

Cada etapa completada requerirá la aprobación del cliente antes de proceder con el siguiente pago.`;

export const DEFAULT_SUPPORT_TERMS = `Se incluye 1 mes de soporte gratuito después de la entrega final del proyecto para resolver cualquier incidencia.

Después del período de soporte gratuito, cualquier mantenimiento o modificación adicional será cotizado por separado.`;

export const DEFAULT_TIME_ESTIMATE = `El tiempo estimado para completar este proyecto es de [SEMANAS] semanas de trabajo.

El proyecto estará finalizado en aproximadamente 3 meses (considerando una semana laboral de 40 horas).`;

export const DEFAULT_PROJECT_NOTE = `Nota: Cualquier desarrollo previo debe tener un prototipo de diseño aprobado, el cual está incluido en este presupuesto.`;

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Tu Empresa',
  address: '',
  phone: '',
  email: '',
  website: '',
  taxId: ''
};
