"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Regex stricte pour valider l'adresse email
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Validation & Error states
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");

  // Validation en direct de l'email
  const validateEmail = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEmailError("L'adresse e-mail est requise.");
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError("Veuillez entrer une adresse e-mail valide (ex: nom@gmail.com).");
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

  const handleEmailBlur = () => {
    setEmailTouched(true);
    validateEmail(email);
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setFormError("");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setIsGoogleLoading(false);
        setFormError("Impossible de lancer la connexion Google : " + error.message);
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setFormError("Erreur de connexion avec Google.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setEmailTouched(true);

    if (!validateEmail(email)) {
      return;
    }

    if (!password) {
      return setFormError("Veuillez entrer votre mot de passe.");
    }

    setIsLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setIsLoading(false);
      setFormError("Adresse e-mail ou mot de passe incorrect. Assurez-vous que le compte existe bien.");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="space-y-5">
      {formError && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-start space-x-3 text-xs font-semibold border border-rose-100 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Bouton de connexion Google Officielle */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isLoading}
        className="w-full py-3 px-4 flex items-center justify-center text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        ) : (
          <>
            <GoogleIcon />
            <span>Continuer avec Google</span>
          </>
        )}
      </button>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
          ou avec e-mail
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Adresse E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            className={`w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
              emailTouched && emailError
                ? "border-rose-400 bg-rose-50/20 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
            }`}
            placeholder="nom@gmail.com"
          />
          {emailTouched && emailError && (
            <p className="text-[11px] font-bold text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Mot de passe
            </label>
            <Link href="/forgot-password" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-3.5 flex items-center justify-center space-x-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </>
          )}
        </button>

        <div className="text-center text-xs font-medium text-slate-500 mt-4">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
            Créez-en un
          </Link>
        </div>
      </form>
    </div>
  );
};
