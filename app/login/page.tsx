import React from "react";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Content de vous revoir"
      subtitle="Connectez-vous pour accéder à votre espace FacturAfric"
    >
      <LoginForm />
    </AuthLayout>
  );
}
