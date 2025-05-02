"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface PdfPreviewDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function PdfPreviewDrawer({
  isOpen,
  onOpenChange,
  children,
}: PdfPreviewDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 overflow-auto max-w-max">
        <SheetHeader className="p-4 border-b bg-gray-50 sticky top-0 z-10">
          <SheetTitle>Vista previa del PDF</SheetTitle>
          <SheetDescription className="sr-only">
            Vista previa de cómo se verá tu presupuesto en PDF
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 p-6 bg-gray-100 overflow-auto">
          <div className="bg-white shadow-lg mx-auto" style={{ width: "210mm", minHeight: "297mm" }}>
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
