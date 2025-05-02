"use client";

import React, { useState, useEffect } from 'react';
import { useBudget } from '@/lib/budget-context';
import { formatCurrency } from '@/lib/utils';

export default function BudgetPreviewClient() {
  // Estados para todos los valores calculados
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [totalHours, setTotalHours] = useState(0);
  const [totalWeeks, setTotalWeeks] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [advancePayment, setAdvancePayment] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [projectData, setProjectData] = useState<any[]>([]);
  
  // Obtener el contexto del presupuesto
  const { budget, getProjectTotal, getGrandTotal, getProjectHours, getTotalHours, getWeeksFromHours } = useBudget();

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
    const total = getGrandTotal();
    
    setTotalHours(hours);
    setTotalWeeks(weeks);
    setGrandTotal(total);
    setAdvancePayment(total * 0.2); // 20% de adelanto
    
    // Procesar datos de proyectos
    const projects = budget.projects.map(project => {
      const items = project.items.map(item => {
        const hours = typeof item.hours === 'number' && !isNaN(item.hours) ? item.hours : 0;
        const hourlyRate = typeof budget.hourlyRate === 'number' && !isNaN(budget.hourlyRate) ? budget.hourlyRate : 0;
        const weeks = getWeeksFromHours(hours);
        const itemTotal = hours * hourlyRate;
        
        return {
          ...item,
          hours,
          weeks,
          itemTotal
        };
      });
      
      return {
        ...project,
        items,
        totalHours: getProjectHours(project.id),
        totalAmount: getProjectTotal(project.id)
      };
    });
    
    setProjectData(projects);
    setIsLoaded(true);
  }, [budget, getTotalHours, getWeeksFromHours, getGrandTotal, getProjectHours, getProjectTotal]);

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

  return (
    <div className="p-8">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm">
            <p className="text-sm font-medium text-blue-600 mb-1">Nombre</p>
            <p className="font-semibold text-gray-800">{budget.clientName || 'No especificado'}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-50 shadow-sm">
            <p className="text-sm font-medium text-blue-600 mb-1">Correo</p>
            <p className="font-semibold text-gray-800">{budget.clientEmail || 'No especificado'}</p>
          </div>
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
                  <th className="text-right py-4 px-6 font-semibold" style={{ width: '15%' }}>Horas</th>
                  <th className="text-right py-4 px-6 font-semibold" style={{ width: '15%' }}>Semanas</th>
                  <th className="text-right py-4 px-6 font-semibold rounded-tr-xl" style={{ width: '20%' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {project.items.map((item: any, index: number) => {
                  // Alternar colores de fondo para filas
                  const bgClass = index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30';

                  return (
                    <tr key={item.id} className={`${bgClass} hover:bg-blue-50 transition-colors duration-150`}>
                      <td className="py-4 px-6 border-t border-blue-100">{item.description || 'Sin descripción'}</td>
                      <td className="text-right py-4 px-6 border-t border-blue-100 font-medium">{item.hours}</td>
                      <td className="text-right py-4 px-6 border-t border-blue-100 font-medium">{isNaN(item.weeks) ? "0.0" : item.weeks.toFixed(1)}</td>
                      <td className="text-right py-4 px-6 border-t border-blue-100 font-semibold">{isNaN(item.itemTotal) ? formatCurrency(0) : formatCurrency(item.itemTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-blue-600 text-white">
                  <td colSpan={2} className="text-right py-4 px-6 font-semibold">Horas del Proyecto:</td>
                  <td className="text-right py-4 px-6 font-semibold">{project.totalHours}</td>
                  <td className="text-right py-4 px-6 font-bold">{formatCurrency(project.totalAmount)}</td>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <p className="font-semibold text-blue-800">Horas Totales</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">{isNaN(totalHours) ? 0 : totalHours}</p>
          </div>
          
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
              <p className="font-semibold">Total del Presupuesto</p>
            </div>
            <p className="text-3xl font-bold">{isNaN(grandTotal) ? formatCurrency(0) : formatCurrency(grandTotal)}</p>
          </div>
        </div>
      </div>

      {/* Tiempo Estimado */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-blue-900">Tiempo Estimado</h2>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-700 leading-relaxed">
              El tiempo aproximado para acabar el proyecto es de <strong className="text-blue-800">3 meses</strong>, con un trabajo de <strong className="text-blue-800">40 horas semanales</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Forma de Pago */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-blue-900">Forma de Pago</h2>
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
          
          <div className="ml-12 space-y-2 text-gray-700">
            <p>
              El resto del pago se distribuirá por etapas según el avance del proyecto.
            </p>
            <p>
              Cada etapa completada requerirá la aprobación del cliente antes de proceder con el siguiente pago.
            </p>
          </div>
        </div>
      </div>

      {/* Soporte Post-Proyecto */}
      <div className="mb-10">
        <div className="flex items-center mb-4">
          <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
          <h2 className="text-2xl font-bold text-blue-900">Soporte Post-Proyecto</h2>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-4 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="space-y-2 text-gray-700">
              <p>
                Se incluye <strong className="text-blue-800">1 mes de soporte gratuito</strong> después de la entrega final del proyecto para resolver cualquier incidencia.
              </p>
              <p>
                Después del período de soporte gratuito, cualquier mantenimiento o modificación adicional será cotizado por separado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Términos y Condiciones */}
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
    </div>
  );
}
