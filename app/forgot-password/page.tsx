import React from "react";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Entrez votre adresse e-mail pour réinitialiser votre mot de passe"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
