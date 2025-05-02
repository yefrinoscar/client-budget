export interface BudgetItem {
  id: string;
  description: string;
  hours: number;
  unitPrice: number;
  weeks: number;
  itemTotal: number;
}

export interface Project {
  totalHours: number;
  totalAmount: number;
  id: string;
  name: string;
  items: BudgetItem[];
}

export interface Budget {
  clientName: string;
  clientEmail: string;
  date: string;
  projects: Project[];
  terms: string;
  hourlyRate: number;
}

export const DEFAULT_TERMS = `- Tiempo estimado de desarrollo: 6 a 8 semanas
- Forma de pago: 40% anticipo, 30% intermedio, 30% a la entrega
- Soporte post-lanzamiento: Opcional con costo adicional`;
