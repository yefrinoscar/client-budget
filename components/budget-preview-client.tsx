"use client";

import React, { useState, useEffect } from 'react';
import { useBudget } from '@/lib/budget-context';
import { formatCurrency } from '@/lib/utils';
import { BudgetItem, Project } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BudgetPreviewClient() {
  // Estados para todos los valores calculados
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [igv, setIGV] = useState(0);
  const [totalWithIGV, setTotalWithIGV] = useState(0);
  const [advancePayment, setAdvancePayment] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [projectData, setProjectData] = useState<Project[]>([]);
  
  // Estados para edición de secciones
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isEditingSupport, setIsEditingSupport] = useState(false);
  const [isEditingTimeEstimate, setIsEditingTimeEstimate] = useState(false);
  const [isEditingProjectNote, setIsEditingProjectNote] = useState(false);
  const [tempPaymentTerms, setTempPaymentTerms] = useState("");
  const [tempSupportTerms, setTempSupportTerms] = useState("");
  const [tempTimeEstimate, setTempTimeEstimate] = useState("");
  const [tempProjectNote, setTempProjectNote] = useState("");
  
  // Obtener el contexto del presupuesto
  const { budget, getProjectTotal, getSubtotal, getIGV, getTotalWithIGV, getProjectHours, getTotalHours, getWeeksFromHours, updatePaymentTerms, updateSupportTerms, updateTimeEstimate, updateProjectNote } = useBudget();

  // Calcular todos los valores solo en el cliente
  useEffect(() => {
    // Generar número de referencia aleatorio
    setReferenceNumber(`PRE-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
    
    // Actualizar la fecha
    const formattedDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);
    
    // Calcular valores
    const hours = getTotalHours();
    const weeks = getWeeksFromHours(hours);
    const sub = getSubtotal();
    const igvAmount = getIGV();
    const total = getTotalWithIGV();
    
    setTotalWeeks(weeks);
    setSubtotal(sub);
    setIGV(igvAmount);
    setTotalWithIGV(total);
    setAdvancePayment(total * 0.2); // 20% de adelanto
    
    // Procesar datos de proyectos
    const projects = budget.projects.map(project => {
      const items = project.items.map(item => {
        const hours = typeof item.hours === 'number' && !isNaN(item.hours) ? item.hours : 0;
        const fixedPrice = typeof item.fixedPrice === 'number' && !isNaN(item.fixedPrice) ? item.fixedPrice : 0;
        const hourlyRate = typeof budget.hourlyRate === 'number' && !isNaN(budget.hourlyRate) ? budget.hourlyRate : 0;
        const pricingMode = item.pricingMode || 'hourly';
        
        // Calculate item total based on pricing mode
        const itemTotal = pricingMode === 'fixed' ? fixedPrice : (hours * hourlyRate);
        
        return {
          ...item,
          hours,
          itemTotal,
          pricingMode,
          fixedPrice,
          quantity: 1 // Default quantity
        };
      });
      
      // Recalculate project total correctly
      const projectTotal = items.reduce((total, item) => total + item.itemTotal, 0);
      
      return {
        ...project,
        items,
        totalAmount: projectTotal
      };
    });
    
    setProjectData(projects);
    setIsLoaded(true);
  }, [budget, getTotalHours, getWeeksFromHours, getSubtotal, getIGV, getTotalWithIGV, getProjectHours, getProjectTotal]);

  // Funciones para manejar edición de términos de pago
  const handleEditPayment = () => {
    setTempPaymentTerms(budget.paymentTerms || '');
    setIsEditingPayment(true);
  };

  const handleSavePayment = () => {
    updatePaymentTerms(tempPaymentTerms);
    setIsEditingPayment(false);
  };

  const handleCancelPayment = () => {
    setTempPaymentTerms('');
    setIsEditingPayment(false);
  };

  // Funciones para manejar edición de términos de soporte
  const handleEditSupport = () => {
    setTempSupportTerms(budget.supportTerms || '');
    setIsEditingSupport(true);
  };

  const handleSaveSupport = () => {
    updateSupportTerms(tempSupportTerms);
    setIsEditingSupport(false);
  };

  const handleCancelSupport = () => {
    setTempSupportTerms('');
    setIsEditingSupport(false);
  };

  // Funciones para manejar edición de tiempo estimado
  const handleEditTimeEstimate = () => {
    // Reemplazar [SEMANAS] con el valor calculado actual
    const currentWeeks = isNaN(totalWeeks) ? "0.0" : totalWeeks.toFixed(1);
    const timeEstimateText = (budget.timeEstimate || '').replace('[SEMANAS]', currentWeeks);
    setTempTimeEstimate(timeEstimateText);
    setIsEditingTimeEstimate(true);
  };

  const handleSaveTimeEstimate = () => {
    updateTimeEstimate(tempTimeEstimate);
    setIsEditingTimeEstimate(false);
  };

  const handleCancelTimeEstimate = () => {
    setTempTimeEstimate('');
    setIsEditingTimeEstimate(false);
  };

  // Funciones para manejar edición de nota del proyecto
  const handleEditProjectNote = () => {
    setTempProjectNote(budget.projectNote || '');
    setIsEditingProjectNote(true);
  };

  const handleSaveProjectNote = () => {
    updateProjectNote(tempProjectNote);
    setIsEditingProjectNote(false);
  };

  const handleCancelProjectNote = () => {
    setTempProjectNote('');
    setIsEditingProjectNote(false);
  };

  // Mostrar un estado de carga hasta que todos los cálculos estén listos
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 p-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-blue-700 font-medium">Preparando presupuesto...</p>
        </div>
      </div>
    );
  }

  const companyInfo = budget.companyInfo;

  return (
    <div className="p-8">
      {/* Company Header */}
      {companyInfo && companyInfo.name && companyInfo.name.trim() !== '' && (
        <div className="mb-8 pb-6 border-b-2 border-blue-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="flex-shrink-0">
                <img 
                  src="/underla logo.svg" 
                  alt={`${companyInfo.name} Logo`}
                  className="h-16 w-16 object-contain rounded-lg shadow-sm border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900 mb-1">{companyInfo.name}</h1>
                {companyInfo.taxId && companyInfo.taxId.trim() !== '' && (
                  <p className="text-sm text-blue-600 font-medium">RUC: {companyInfo.taxId}</p>
                )}
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-600 space-y-1">
              {companyInfo.address && companyInfo.address.trim() !== '' && (
                <p className="max-w-sm">{companyInfo.address}</p>
              )}
              <div className="space-y-1">
                {companyInfo.phone && companyInfo.phone.trim() !== '' && (
                  <p>📞 {companyInfo.phone}</p>
                )}
                {companyInfo.email && companyInfo.email.trim() !== '' && (
                  <p>✉️ {companyInfo.email}</p>
                )}
                {companyInfo.website && companyInfo.website.trim() !== '' && (
                  <p>🌐 {companyInfo.website}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="mb-10 pb-6 border-b border-blue-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Propuesta de Presupuesto
            </h1>
            <p className="text-blue-600 font-medium">{currentDate}</p>
          </div>
          <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700">Ref: {referenceNumber}</p>
          </div>
        </div>
      </div>

      {/* Información del Cliente */}
      <div className="mb-10 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Información del Cliente
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {budget.clientName && budget.clientName.trim() !== '' && (
            <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm">
              <p className="text-sm font-medium text-blue-600 mb-1">Nombre</p>
              <p className="font-semibold text-gray-800">{budget.clientName}</p>
            </div>
          )}
          {budget.clientEmail && budget.clientEmail.trim() !== '' && (
            <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm">
              <p className="text-sm font-medium text-blue-600 mb-1">Correo</p>
              <p className="font-semibold text-gray-800">{budget.clientEmail}</p>
            </div>
          )}
          {budget.clientPhone && budget.clientPhone.trim() !== '' && (
            <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm">
              <p className="text-sm font-medium text-blue-600 mb-1">Teléfono</p>
              <p className="font-semibold text-gray-800">{budget.clientPhone}</p>
            </div>
          )}
          {(!budget.clientName || budget.clientName.trim() === '') && 
           (!budget.clientEmail || budget.clientEmail.trim() === '') && 
           (!budget.clientPhone || budget.clientPhone.trim() === '') && (
            <div className="col-span-full text-center py-4">
              <p className="text-gray-500">No se ha especificado información del cliente</p>
            </div>
          )}
        </div>
      </div>

      {/* Proyectos */}
      {projectData.map(project => (
        <div key={project.id} className="mb-10">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-blue-900">{project.name}</h2>
          </div>

          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-blue-100">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                  <th className="text-left py-4 px-6 font-semibold rounded-tl-xl" style={{ width: '50%' }}>Descripción</th>
                  <th className="text-center py-4 px-6 font-semibold" style={{ width: '10%' }}>Cant.</th>
                  <th className="text-right py-4 px-6 font-semibold" style={{ width: '20%' }}>Precio Unitario</th>
                  <th className="text-right py-4 px-6 font-semibold rounded-tr-xl" style={{ width: '20%' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {project.items.map((item: any, index: number) => {
                  // Alternar colores de fondo para filas
                  const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30';
                  const hourlyRate = typeof budget.hourlyRate === 'number' && !isNaN(budget.hourlyRate) ? budget.hourlyRate : 0;

                  return (
                    <tr key={item.id} className={`${bgClass} hover:bg-blue-50 transition-colors duration-150`}>
                      <td className="py-4 px-6 border-t border-blue-100">
                        <div>
                          <p className="font-medium">{item.description || 'Sin descripción'}</p>
                          {item.pricingMode === 'hourly' && item.hours > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              {item.hours} {item.hours === 1 ? 'hora' : 'horas'} × {formatCurrency(hourlyRate)}/hora
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-4 px-6 border-t border-blue-100">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="text-right py-4 px-6 border-t border-blue-100 font-medium">
                        {formatCurrency(item.itemTotal)}
                      </td>
                      <td className="text-right py-4 px-6 border-t border-blue-100 font-semibold text-blue-900">
                        {formatCurrency(item.itemTotal * item.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-blue-600 text-white">
                  <td colSpan={3} className="text-right py-4 px-6 font-semibold">Total del Proyecto:</td>
                  <td className="text-right py-4 px-6 font-bold text-lg">{formatCurrency(project.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      {/* Resumen */}
      <div className="mb-10">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-blue-900">Resumen</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold text-blue-800">Semanas Estimadas</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">{isNaN(totalWeeks) ? "0.0" : totalWeeks.toFixed(1)}</p>
            <p className="text-xs text-blue-600 mt-1">(40 horas/semana)</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-md text-white">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold">Horas Totales</p>
            </div>
            <p className="text-3xl font-bold">{isNaN(getTotalHours()) ? "0" : getTotalHours()}</p>
            <p className="text-sm opacity-90">Total del proyecto</p>
          </div>
        </div>
      </div>

      {/* Desglose de Costos */}
      <div className="mb-10">
        <div className="flex items-center mb-6">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-blue-900">Desglose de Costos</h2>
        </div>
        
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-blue-100">
              <span className="font-semibold text-lg">Subtotal:</span>
              <span className="text-lg font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-blue-100">
              <span className="font-semibold text-lg text-orange-600">IGV (18%):</span>
              <span className="text-lg font-bold text-orange-600">{formatCurrency(igv)}</span>
            </div>
            <div className="flex justify-between items-center py-4 bg-blue-50 px-4 rounded-lg">
              <span className="font-bold text-xl text-blue-800">Total:</span>
              <span className="text-2xl font-bold text-blue-800">{formatCurrency(totalWithIGV)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tiempo Estimado - Solo mostrar si no está vacío */}
      {(budget.timeEstimate && budget.timeEstimate.trim() !== '') && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-blue-900">Tiempo Estimado</h2>
            </div>
            {!isEditingTimeEstimate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditTimeEstimate}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                {isEditingTimeEstimate ? (
                  <div className="space-y-3">
                    <Textarea
                      value={tempTimeEstimate}
                      onChange={(e) => setTempTimeEstimate(e.target.value)}
                      placeholder="Escriba la estimación de tiempo..."
                      className="min-h-[100px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveTimeEstimate}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelTimeEstimate}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line text-gray-700">
                    {budget.timeEstimate?.replace('[SEMANAS]', isNaN(totalWeeks) ? "0.0" : totalWeeks.toFixed(1))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nota del Proyecto - Solo mostrar si no está vacío */}
      {(budget.projectNote && budget.projectNote.trim() !== '') && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-blue-900">Notas Importantes</h2>
            </div>
            {!isEditingProjectNote && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditProjectNote}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-sm">
            <div className="flex items-start">
              <div className="bg-yellow-100 p-2 rounded-full mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                {isEditingProjectNote ? (
                  <div className="space-y-3">
                    <Textarea
                      value={tempProjectNote}
                      onChange={(e) => setTempProjectNote(e.target.value)}
                      placeholder="Escriba las notas importantes del proyecto..."
                      className="min-h-[100px] resize-none bg-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveProjectNote}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelProjectNote}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line text-yellow-800 font-medium">
                    {budget.projectNote}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forma de Pago - Solo mostrar si no está vacío */}
      {(budget.paymentTerms && budget.paymentTerms.trim() !== '') && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-blue-900">Forma de Pago</h2>
            </div>
            {!isEditingPayment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditPayment}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex mb-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-1">Pago inicial (20%):</p>
                <p className="text-blue-700 font-bold text-xl">{isNaN(advancePayment) ? formatCurrency(0) : formatCurrency(advancePayment)}</p>
              </div>
            </div>
            
            <div className="ml-12">
              {isEditingPayment ? (
                <div className="space-y-3">
                  <Textarea
                    value={tempPaymentTerms}
                    onChange={(e) => setTempPaymentTerms(e.target.value)}
                    placeholder="Escriba los términos de pago..."
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSavePayment}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelPayment}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-line text-gray-700">
                  {budget.paymentTerms}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Soporte Post-Proyecto - Solo mostrar si no está vacío */}
      {(budget.supportTerms && budget.supportTerms.trim() !== '') && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold text-blue-900">Soporte Post-Proyecto</h2>
            </div>
            {!isEditingSupport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditSupport}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Editar
              </Button>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex-1">
                {isEditingSupport ? (
                  <div className="space-y-3">
                    <Textarea
                      value={tempSupportTerms}
                      onChange={(e) => setTempSupportTerms(e.target.value)}
                      placeholder="Escriba los términos de soporte..."
                      className="min-h-[100px] resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveSupport}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelSupport}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-line text-gray-700">
                    {budget.supportTerms}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Términos y Condiciones - Solo mostrar si no está vacío */}
      {budget.terms && budget.terms.trim() !== '' && (
        <div className="mb-10">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-blue-900">Términos y Condiciones</h2>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-start mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">{budget.terms}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
