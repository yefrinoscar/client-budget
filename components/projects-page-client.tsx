"use client";

import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import BudgetPreviewClient from '@/components/budget-preview-client';

const ProjectsPageClient: React.FC = () => {
  // Estado para almacenar el año actual
  // const [currentYear, setCurrentYear] = useState("");
  
  // // Actualizar el año solo en el cliente
  // useEffect(() => {
  //   setCurrentYear(new Date().getFullYear().toString());
  // }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-r from-blue-500 to-blue-700 rounded-b-[30%] opacity-10"></div>
      
      <div className="relative container mx-auto py-12 px-6 max-w-4xl">
        <div className="mb-8 flex items-center">
          <Link href="/">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white shadow-sm hover:shadow-md transition-all duration-300 border-blue-100 hover:border-blue-300 text-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver al Editor
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-blue-50">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-64 p-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-t-blue-500 border-b-blue-700 border-l-blue-600 border-r-blue-600 animate-spin mx-auto mb-4"></div>
                  <p className="text-lg text-blue-700 font-medium">Cargando vista previa...</p>
                </div>
              </div>
            }
          >
            <BudgetPreviewClient />
          </Suspense>
        </div>
        
        <div className="mt-8 text-center text-sm text-blue-500 opacity-70">
          {/* Conditionally render the paragraph only when currentYear has a value */}
          {/* {currentYear && <p> {currentYear} Presupuestos Profesionales</p>} */}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPageClient;
