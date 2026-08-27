import React from "react";
import { InvoiceDetailView } from "@/features/invoice/InvoiceDetailView";

interface InvoiceDetailPageProps {
  params: {
    id: string;
  };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetailView invoiceId={id} />;
}
