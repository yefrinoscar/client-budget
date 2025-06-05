"use client";

import { useState, useEffect, useRef } from 'react';
import { usePDF } from 'react-to-pdf';
import { Button } from '@/components/ui/button';
import { useBudget } from '@/lib/budget-context';
import { FileDown, Eye, Download, Upload } from 'lucide-react';
import { PdfPreviewDrawer } from './pdf-preview-drawer';
import { Budget } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function PdfExportClient() {
  const { budget, updateBudget } = useBudget();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toPDF, targetRef } = usePDF({
    filename: `presupuesto-${budget.clientName || 'cliente'}.pdf`,
    page: { margin: 10 } // Márgenes más pequeños
  });
  const [isCapturing, setIsCapturing] = useState(false); // State to control temporary render
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const { getProjectTotal, getSubtotal, getIGV, getTotalWithIGV, getProjectHours, getTotalHours, getWeeksFromHours } = useBudget();
  const totalHours = getTotalHours();
  const totalWeeks = getWeeksFromHours(totalHours);
  const subtotal = getSubtotal();
  const igv = getIGV();
  const totalWithIGV = getTotalWithIGV();
  const advancePayment = totalWithIGV * 0.2; // 20% de adelanto

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

  // JSON Export functionality
  const handleExportJSON = () => {
    try {
      // Create comprehensive export data including all rich text content
      const dataToExport = {
        ...budget,
        exportDate: new Date().toISOString(),
        version: "1.0",
        exportInfo: {
          appName: "Budget App",
          richTextIncluded: !!budget.preTableMessage,
          igvEnabled: budget.igvEnabled ?? true,
          totalProjects: budget.projects.length,
          totalItems: budget.projects.reduce((total, project) => total + project.items.length, 0)
        }
      };
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizacion-${budget.clientName || 'sin-nombre'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success message with details
      const richTextStatus = budget.preTableMessage ? 'incluido' : 'no incluido';
      alert(`✅ Cotización exportada exitosamente!\n\n📄 Contenido exportado:\n• ${budget.projects.length} proyecto(s)\n• Texto enriquecido: ${richTextStatus}\n• IGV: ${budget.igvEnabled ? 'habilitado' : 'deshabilitado'}\n• Información de empresa: ${budget.companyInfo?.name ? 'incluida' : 'no incluida'}`);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Error al exportar el archivo JSON. Por favor, inténtalo de nuevo.');
    }
  };

  // JSON Import functionality
  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const importedData = JSON.parse(jsonContent);
        
        // Validate the imported data structure
        if (!importedData || typeof importedData !== 'object') {
          throw new Error('Formato de archivo inválido');
        }

        // Basic validation of required fields
        const requiredFields = ['clientName', 'clientEmail', 'projects', 'terms', 'hourlyRate'];
        const hasRequiredFields = requiredFields.every(field => 
          importedData.hasOwnProperty(field)
        );

        if (!hasRequiredFields) {
          throw new Error('El archivo no contiene todos los campos requeridos');
        }

        // Clean up the data (remove export metadata)
        const { exportDate: _exportDate, version: _version, exportInfo: _exportInfo, ...cleanData } = importedData;
        
        // Update the budget with imported data
        updateBudget(cleanData);
        
        // Show success message with import details
        const richTextStatus = cleanData.preTableMessage ? 'incluido' : 'no incluido';
        const projectCount = cleanData.projects?.length || 0;
        alert(`✅ Cotización importada exitosamente!\n\n📄 Contenido importado:\n• ${projectCount} proyecto(s)\n• Texto enriquecido: ${richTextStatus}\n• IGV: ${cleanData.igvEnabled ? 'habilitado' : 'deshabilitado'}\n• Cliente: ${cleanData.clientName || 'sin nombre'}`);
      } catch (error) {
        console.error('Error importing JSON:', error);
        alert('Error al importar el archivo. Por favor, verifica que sea un archivo JSON válido de una cotización.');
      }
    };

    reader.readAsText(file);
    // Reset the input value so the same file can be selected again
    event.target.value = '';
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
        <Button 
          onClick={handleExportJSON}
          className="cursor-pointer"
          variant="outline"
          style={{ borderColor: '#10b981', color: '#10b981' }}
        >
          <Download className="h-4 w-4 mr-2" /> Exportar JSON
        </Button>
        <Button 
          onClick={handleImportJSON}
          className="cursor-pointer"
          variant="outline"
          style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
        >
          <Upload className="h-4 w-4 mr-2" /> Importar JSON
        </Button>
      </div>

      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
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
            totalWeeks={totalWeeks}
            subtotal={subtotal}
            igv={igv}
            totalWithIGV={totalWithIGV}
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
            totalWeeks={totalWeeks}
            subtotal={subtotal}
            igv={igv}
            totalWithIGV={totalWithIGV}
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
  totalWeeks: number;
  subtotal: number;
  igv: number;
  totalWithIGV: number;
  advancePayment: number;
  getProjectHours: (projectId: string) => number;
  getProjectTotal: (projectId: string) => number;
}

function PdfContent({ 
  budget, 
  currentDate, 
  totalWeeks,
  subtotal,
  igv,
  totalWithIGV,
  advancePayment,
  getProjectTotal
}: PdfContentProps) {
  const companyInfo = budget.companyInfo;
  
  return (
    <>
      {/* Company Header */}
      {companyInfo && companyInfo.name && companyInfo.name.trim() !== '' && (
        <div className="mb-6 pb-4" style={{ borderBottom: '2px solid #3b82f6', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img 
                  src="/underla logo.svg" 
                  alt={`${companyInfo.name} Logo`}
                  style={{ height: '48px', width: '48px', objectFit: 'contain', borderRadius: '4px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: '#1e3a8a' }}>{companyInfo.name}</h1>
                {companyInfo.taxId && companyInfo.taxId.trim() !== '' && (
                  <p style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>RUC: {companyInfo.taxId}</p>
                )}
              </div>
            </div>
            
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280' }}>
              {companyInfo.address && companyInfo.address.trim() !== '' && (
                <p style={{ maxWidth: '200px', marginBottom: '4px' }}>{companyInfo.address}</p>
              )}
              {companyInfo.phone && companyInfo.phone.trim() !== '' && (
                <p style={{ marginBottom: '2px' }}>Tel: {companyInfo.phone}</p>
              )}
              {companyInfo.email && companyInfo.email.trim() !== '' && (
                <p style={{ marginBottom: '2px' }}>Email: {companyInfo.email}</p>
              )}
              {companyInfo.website && companyInfo.website.trim() !== '' && (
                <p>Web: {companyInfo.website}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="mb-6 border-b pb-4" style={{ borderColor: '#4D2DDA', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#4D2DDA' }}>Cotización</h1>
        <p style={{ color: '#64748b' }}>Fecha: {currentDate || 'Calculando...'}</p>
      </div>
      
      {/* Información del Cliente */}
      <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f8fafc', border: '1px solid #E2E8F0', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#1e293b' }}>Información del Cliente</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {budget.clientName && budget.clientName.trim() !== '' && (
            <div>
              <p style={{ color: '#64748b' }}>Nombre:</p>
              <p className="font-medium">{budget.clientName}</p>
            </div>
          )}
          {budget.clientEmail && budget.clientEmail.trim() !== '' && (
            <div>
              <p style={{ color: '#64748b' }}>Correo:</p>
              <p className="font-medium">{budget.clientEmail}</p>
            </div>
          )}
          {budget.clientPhone && budget.clientPhone.trim() !== '' && (
            <div>
              <p style={{ color: '#64748b' }}>Teléfono:</p>
              <p className="font-medium">{budget.clientPhone}</p>
            </div>
          )}
          {(!budget.clientName || budget.clientName.trim() === '') && 
           (!budget.clientEmail || budget.clientEmail.trim() === '') && 
           (!budget.clientPhone || budget.clientPhone.trim() === '') && (
            <div style={{ color: '#6b7280', fontStyle: 'italic' }}>
              No se ha especificado información del cliente
            </div>
          )}
        </div>
      </div>
      
      {/* Pre-table Message */}
      {budget.preTableMessage && budget.preTableMessage.trim() !== '' && (
        <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#374151' }}>Información Importante</h2>
          <div 
            className="rich-text-content whitespace-pre-line" 
            style={{ color: '#4b5563' }}
            dangerouslySetInnerHTML={{ __html: budget.preTableMessage }}
          />
        </div>
      )}

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
                <th className="text-left py-3 px-4" style={{ width: '50%' }}>Descripción</th>
                <th className="text-center py-3 px-4" style={{ width: '10%' }}>Cant.</th>
                <th className="text-right py-3 px-4" style={{ width: '20%' }}>Precio Unitario</th>
                <th className="text-right py-3 px-4" style={{ width: '20%' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {project.items.map(item => {
                // Asegurar valores válidos
                const hours = typeof item.hours === 'number' && !isNaN(item.hours) ? item.hours : 0;
                const fixedPrice = typeof item.fixedPrice === 'number' && !isNaN(item.fixedPrice) ? item.fixedPrice : 0;
                const hourlyRate = typeof budget.hourlyRate === 'number' && !isNaN(budget.hourlyRate) ? budget.hourlyRate : 0;
                const pricingMode = item.pricingMode || 'hourly';
                const itemTotal = pricingMode === 'fixed' ? fixedPrice : (hours * hourlyRate);
                const quantity = 1; // Default quantity
                
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td className="py-3 px-4">
                      <div>
                        <p style={{ fontWeight: '500', marginBottom: '2px' }}>{item.description || 'Sin descripción'}</p>
                        {pricingMode === 'hourly' && hours > 0 && (
                          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0' }}>
                            {hours} {hours === 1 ? 'hora' : 'horas'} × {formatCurrency(hourlyRate)}/hora
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4" style={{ fontWeight: '500' }}>
                      {quantity}
                    </td>
                    <td className="text-right py-3 px-4" style={{ fontWeight: '500' }}>
                      {formatCurrency(itemTotal)}
                    </td>
                    <td className="text-right py-3 px-4" style={{ fontWeight: '600', color: '#1e40af' }}>
                      {formatCurrency(itemTotal * quantity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#1e40af', color: 'white' }}>
                <td colSpan={3} className="text-right font-semibold py-3 px-4">Total del Proyecto:</td>
                <td className="text-right font-bold py-3 px-4" style={{ fontSize: '16px' }}>{formatCurrency(getProjectTotal(project.id))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
      
      {/* Desglose de Costos */}
      <div className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#1e293b' }}>Desglose de Costos</h2>
        <div className="p-4 border rounded-md" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <div className="space-y-3">
            <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <span className="font-semibold">Subtotal:</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            {(budget.igvEnabled ?? true) && (
              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid #e2e8f0' }}>
                <span className="font-semibold" style={{ color: '#ea580c' }}>IGV (18%):</span>
                <span className="font-bold" style={{ color: '#ea580c' }}>{formatCurrency(igv)}</span>
              </div>
            )}
            <div className="flex justify-between py-3" style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '6px' }}>
              <span className="font-bold text-lg" style={{ color: '#1e40af' }}>Total:</span>
              <span className="font-bold text-xl" style={{ color: '#1e40af' }}>{formatCurrency(totalWithIGV)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tiempo Estimado - Solo mostrar si no está vacío */}
      {budget.timeEstimate && budget.timeEstimate.trim() !== '' && (
        <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f8fafc' }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e293b' }}>Tiempo Estimado</h2>
          <div className="whitespace-pre-line">
            {budget.timeEstimate.replace('[SEMANAS]', isNaN(totalWeeks) ? "0.0" : totalWeeks.toFixed(1))}
          </div>
        </div>
      )}
      
      {/* Nota del Proyecto - Solo mostrar si no está vacío */}
      {budget.projectNote && budget.projectNote.trim() !== '' && (
        <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#ad6800' }}>Notas Importantes</h2>
          <div className="whitespace-pre-line" style={{ color: '#ad6800', fontWeight: '500' }}>
            {budget.projectNote}
          </div>
        </div>
      )}
      
      {/* Forma de Pago - Solo mostrar si no está vacío */}
      {budget.paymentTerms && budget.paymentTerms.trim() !== '' && (
        <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f8fafc' }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e293b' }}>Forma de Pago</h2>
          <p className="mb-2">
            <strong>Pago inicial (20%):</strong> {isNaN(advancePayment) ? formatCurrency(0) : formatCurrency(advancePayment)}
          </p>
          <div className="whitespace-pre-line">{budget.paymentTerms}</div>
        </div>
      )}
      
      {/* Soporte Post-Proyecto - Solo mostrar si no está vacío */}
      {budget.supportTerms && budget.supportTerms.trim() !== '' && (
        <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f8fafc' }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e293b' }}>Soporte Post-Proyecto</h2>
          <div className="whitespace-pre-line">{budget.supportTerms}</div>
        </div>
      )}
      
      {/* Términos y Condiciones - Solo mostrar si no está vacío */}
      {budget.terms && budget.terms.trim() !== '' && (
        <div className="mb-6 p-4 border rounded-md" style={{ backgroundColor: '#f8fafc' }}>
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#1e293b' }}>Términos y Condiciones</h2>
          <div className="whitespace-pre-line">{budget.terms}</div>
        </div>
      )}
    </>
  );
} 