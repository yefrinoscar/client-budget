"use client";

import React, { Suspense } from 'react';
import PdfExportClient from './pdf-export-client';

export const PdfExport: React.FC = () => {
  return (
    <Suspense fallback={<div className="mb-6">Cargando exportador de PDF...</div>}>
      <PdfExportClient />
    </Suspense>
  );
};
