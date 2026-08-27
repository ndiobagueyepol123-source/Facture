import React from "react";
import { CreateInvoiceStudio } from "@/features/invoice/CreateInvoiceStudio";

interface EditInvoicePageProps {
  params: {
    id: string;
  };
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;
  return <CreateInvoiceStudio isEditing={true} initialInvoiceId={id} />;
}
