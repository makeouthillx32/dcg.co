// app/dashboard/[id]/Documents/page.tsx
'use client';

import React, { Suspense } from 'react';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Documents from '@/components/documents';
import { DocumentsSkeleton } from '@/components/documents/skeleton'; // Fixed: Added 's' to DocumentsSkeleton
import DocumentsErrorBoundary from '@/components/documents/DocumentsErrorBoundary';

export default function DocumentsPage() {
  return (
    <>
      <Breadcrumb pageName="Documents" />
      
      <Suspense 
        fallback={<DocumentsSkeleton viewMode="grid" count={12} />}
      >
        <DocumentsErrorBoundary>
          <Documents />
        </DocumentsErrorBoundary>
      </Suspense>
    </>
  );
}