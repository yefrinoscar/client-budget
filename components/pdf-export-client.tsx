"use client";

import { useState, useEffect } from 'react';
import { usePDF } from 'react-to-pdf';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/lib/budget-context';
import { FileDown, Eye } from 'lucide-react';
import { PdfPreviewDrawer } from './pdf-preview-drawer';
import { Budget } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function PdfExportClient() {
  const { budget, getProjectTotal, getGrandTotal, getProjectHours, getTotalHours } = useBudget();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toPDF, targetRef } = usePDF({
    filename: `presupuesto-${budget.clientName || 'cliente'}.pdf`,
    page: { margin: 10 } // Márgenes más pequeños
  });
  const [isCapturing, setIsCapturing] = useState(false); // State to control temporary render

  const [currentDate, setCurrentDate] = useState(""); // Initialize state

  // Calculate date only on the client after mount
  useEffect(() => {
    const formattedDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Cálculos para el tiempo estimado y forma de pago
  const totalHours = getTotalHours();
  const grandTotal = getGrandTotal();
  const advancePayment = grandTotal * 0.2; // 20% de adelanto

  // Use useEffect to trigger PDF generation after isCapturing state updates and component re-renders
  useEffect(() => {
    if (isCapturing) {
      const generatePdf = async () => {
        await document.fonts.ready; // Ensure fonts are loaded
        await toPDF(); // Wait for PDF generation to complete
        setIsCapturing(false); // Reset capturing state
      };
      // Use a small timeout to ensure the DOM updates before capture
      const timerId = setTimeout(generatePdf, 150); // Increased timeout to 150ms
      return () => clearTimeout(timerId); // Cleanup timer on unmount or state change
    }
  }, [isCapturing, toPDF]);

  const handleExportClick = () => {
    setIsCapturing(true); // Start the capture process
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button 
          onClick={() => setIsPreviewOpen(true)} 
          className="cursor-pointer"
          variant="outline"
        >
          <Eye className="h-4 w-4 mr-2" /> Vista Previa
        </Button>
        <Button 
          onClick={handleExportClick}
          className="cursor-pointer"
          style={{ backgroundColor: '#4D2DDA', color: 'white' }}
        >
          <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>
      
      {/* Temporarily render content in a hidden div JUST for PDF capture */}
      {isCapturing && (
        <div
          ref={targetRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '0px',
            backgroundColor: '#fff',
            padding: '6px', // Márgenes más pequeños
            pointerEvents: 'none',
            width: '794px', // A4 width approx
            minHeight: '1122px', // A4 height approx, but allows to grow
            height: 'auto', // Let it grow if needed
            boxSizing: 'border-box',
          }}
        >
          <PdfContent
            budget={budget}
            currentDate={currentDate}
            totalHours={totalHours}
            grandTotal={grandTotal}
            advancePayment={advancePayment}
            getProjectHours={getProjectHours}
            getProjectTotal={getProjectTotal}
          />
        </div>
      )}
      
      {/* PDF Preview Drawer (remains unchanged, uses visible content) */}
      <PdfPreviewDrawer 
        isOpen={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen}
      >
        <div className="p-4">
          <PdfContent 
            budget={budget}
            currentDate={currentDate}
            totalHours={totalHours}
            grandTotal={grandTotal}
            advancePayment={advancePayment}
            getProjectHours={getProjectHours}
            getProjectTotal={getProjectTotal}
          />
        </div>
      </PdfPreviewDrawer>
    </div>
  );
}

// Separate component for PDF content to avoid duplication
interface PdfContentProps {
  budget: Budget;
  currentDate: string;
  totalHours: number;
  grandTotal: number;
  advancePayment: number;
  getProjectHours: (projectId: string) => number;
  getProjectTotal: (projectId: string) => number;
}

function PdfContent({ 
  budget, 
  currentDate, 
  totalHours, 
  grandTotal, 
  advancePayment,
  getProjectTotal
}: PdfContentProps) {
  return (
    <>
      {/* Encabezado */}
      <div className="mb-6 border-b pb-4" style={{ borderColor: '#4D2DDA', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#4D2DDA' }}>Cotizacion de Yachting</h1>
        <p style={{ color: '#64748b' }}>Fecha: {currentDate || 'Calculando...'}</p>
      </div>
      
      {/* Información del Cliente */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid #E2E8F0', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#1e293b' }}>Información del Cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p style={{ color: '#64748b' }}>Nombre:</p>
            <p className="font-medium">{budget.clientName || 'No especificado'}</p>
          </div>
          <div>
            <p style={{ color: '#64748b' }}>Correo:</p>
            <p className="font-medium">{budget.clientEmail || 'No especificado'}</p>
          </div>
        </div>
      </div>
      
      {/* Proyectos */}
      {budget.projects.map((project, idx) => (
        <div
          key={project.id}
          className="mb-6"
          style={{
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
            ...(idx < budget.projects.length - 1
              ? { breakAfter: 'page', pageBreakAfter: 'always' }
              : {}),
          }}
        >
          <h2 className="text-xl font-semibold border-b pb-2 mb-4" style={{ color: '#1e293b', borderColor: '#E2E8F0' }}>{project.name}</h2>
          
          <table className="w-full mb-4" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th className="text-left py-3 px-4" style={{ width: '70%' }}>Descripción</th>
                <th className="text-right py-3 px-4" style={{ width: '30%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {project.items.map(item => {
                // Asegurar valores válidos
                const hours = typeof item.hours === 'number' && !isNaN(item.hours) ? item.hours : 0;
                const hourlyRate = typeof budget.hourlyRate === 'number' && !isNaN(budget.hourlyRate) ? budget.hourlyRate : 0;
                const itemTotal = hours * hourlyRate;
                
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td className="py-3 px-4">{item.description || 'Sin descripción'}</td>
                    <td className="text-right py-3 px-4">{isNaN(itemTotal) ? formatCurrency(0) : formatCurrency(itemTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <td className="text-right font-semibold py-3 px-4">Total del Proyecto:</td>
                <td className="text-right font-semibold py-3 px-4">{formatCurrency(getProjectTotal(project.id))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
      
      {/* Resumen */}
      <div className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#1e293b' }}>Resumen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded-md" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="font-semibold" style={{ color: '#334155' }}>Horas Totales:</p>
            <p className="text-lg">{isNaN(totalHours) ? 0 : totalHours}</p>
          </div>
          <div className="p-4 border rounded-md" style={{ backgroundColor: '#eff6ff', border: '1px solid #e2e8f0' }}>
            <p className="font-semibold" style={{ color: '#334155' }}>Total del Presupuesto:</p>
            <p className="text-2xl font-bold" style={{ color: '#4D2DDA' }}>{isNaN(grandTotal) ? formatCurrency(0) : formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-md border text-sm" style={{ background: '#fffbe6', borderColor: '#ffe58f', color: '#ad6800' }}>
        <strong>Nota:</strong> Cualquier desarrollo previo debe tener un prototipo de diseño aprobado, el cual está incluido en este presupuesto.
      </div>
      
      {/* Tiempo Estimado */}
      <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f8fafc' }}>
        <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e293b' }}>Tiempo Estimado</h2>
        <p>
          El tiempo estimado para completar este proyecto es de <strong>{isNaN(totalHours) ? 0 : totalHours} horas</strong> de trabajo. 
          El proyecto estara finalizado en aproximadamente <strong>3 meses </strong> 
          (considerando una semana laboral de 40 horas).
        </p>
      </div>
      
      {/* Forma de Pago */}
      <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f8fafc' }}>
        <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e293b' }}>Forma de Pago</h2>
        <p className="mb-2">
          <strong>Pago inicial (20%):</strong> {isNaN(advancePayment) ? formatCurrency(0) : formatCurrency(advancePayment)}
        </p>
        <p className="mb-2">
          El resto del pago se distribuirá por etapas según el avance del proyecto.
        </p>
        <p>
          Cada etapa completada requerirá la aprobación del cliente antes de proceder con el siguiente pago.
        </p>
      </div>
      
      {/* Soporte Post-Proyecto */}
      <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f8fafc' }}>
        <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e293b' }}>Soporte Post-Proyecto</h2>
        <p className="mb-2">
          Se incluye <strong>1 mes de soporte gratuito</strong> después de la entrega final del proyecto para resolver cualquier incidencia.
        </p>
        <p>
          Después del período de soporte gratuito, cualquier mantenimiento o modificación adicional será cotizado por separado.
        </p>
      </div>
      
      {/* Términos y Condiciones */}
      <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f8fafc' }}>
        <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e293b' }}>Términos y Condiciones</h2>
        <div className="whitespace-pre-line">{budget.terms}</div>
      </div>
      
   
    </>
  );
}
