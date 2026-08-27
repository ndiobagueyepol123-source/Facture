"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError("L'adresse e-mail est requise.");
      return false;
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      setEmailError("Veuillez entrer une adresse e-mail valide.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailTouched) {
      validateEmail(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setEmailTouched(true);

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });

    setIsLoading(false);

    if (error) {
      setFormError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-4 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
          <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
        </div>
        <h3 className="text-xl font-black text-slate-900">E-mail envoyé !</h3>
        <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
          Vérifiez votre boîte de réception pour <strong className="text-slate-700">{email}</strong>. Vous y trouverez un lien pour réinitialiser votre mot de passe.
        </p>
        <div className="pt-2">
          <Link href="/login">
            <button className="w-full py-3.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all">
              Retour à la connexion
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-start space-x-3 text-xs font-semibold border border-rose-100">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Adresse E-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={handleEmailChange}
          onBlur={() => {
            setEmailTouched(true);
            validateEmail(email);
          }}
          className={`w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
            emailTouched && emailError
              ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
          }`}
          placeholder="vous@exemple.com"
        />
        {emailTouched && emailError && (
          <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>{emailError}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 flex items-center justify-center space-x-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Mail className="w-4 h-4" />
            <span>Recevoir le lien de réinitialisation</span>
          </>
        )}
      </button>

      <div className="text-center mt-4">
        <Link href="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à la connexion</span>
        </Link>
      </div>
    </form>
  );
};
