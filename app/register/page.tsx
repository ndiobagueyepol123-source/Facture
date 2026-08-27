import React from "react";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { RegisterForm } from "@/features/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez FacturAfric et commencez à facturer"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
