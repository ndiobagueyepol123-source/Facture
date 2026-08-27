"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Regex stricte pour valider l'adresse e-mail
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Liste des fautes de frappe courantes sur les domaines populaires
const DOMAIN_TYPOS: Record<string, string> = {
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmaile.com": "gmail.com",
  "gmail.fr": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "hotmial.com": "hotmail.com",
  "hotmali.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
};

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

export const RegisterForm = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Validation states
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Validation en direct de l'e-mail
  const validateEmail = (value: string): boolean => {
    const trimmed = value.trim().toLowerCase();
    setEmailSuggestion(null);

    if (!trimmed) {
      setEmailError("L'adresse e-mail est requise.");
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError("Veuillez entrer une adresse e-mail valide (ex: nom@gmail.com).");
      return false;
    }

    const domain = trimmed.split("@")[1];
    if (domain && DOMAIN_TYPOS[domain]) {
      const correctEmail = trimmed.split("@")[0] + "@" + DOMAIN_TYPOS[domain];
      setEmailSuggestion(correctEmail);
      setEmailError(`Attention à la faute de frappe dans le domaine (@${domain}).`);
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

  const applySuggestion = (suggested: string) => {
    setEmail(suggested);
    setEmailSuggestion(null);
    setEmailError("");
  };

  const handleGoogleSignUp = async () => {
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
        setFormError("Impossible d'effectuer l'inscription avec Google : " + error.message);
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setFormError("Erreur d'inscription avec Google.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setEmailTouched(true);

    // 1. Validation de l'email
    if (!validateEmail(email)) {
      return;
    }

    // 2. Validation du mot de passe
    if (password.length < 6) {
      return setFormError("Le mot de passe doit comporter au moins 6 caractères.");
    }

    if (password !== confirmPassword) {
      return setFormError("Les mots de passe ne correspondent pas.");
    }

    setIsLoading(true);

    try {
      // 3. Appel de la route d'inscription sécurisée
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setIsLoading(false);
        return setFormError(data.error || "Une erreur est survenue lors de la création du compte.");
      }

      // 4. Connexion automatique après inscription réussie
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setIsLoading(false);
        return setFormError(signInError.message);
      }

      // 5. Redirection vers le Dashboard
      router.push("/");
      router.refresh();

    } catch (err) {
      setIsLoading(false);
      setFormError("Impossible de joindre le serveur. Veuillez vérifier votre connexion.");
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

      {/* Inscription 1-clic avec Google Réel et Vérifié */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading || isLoading}
        className="w-full py-3 px-4 flex items-center justify-center text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl shadow-xs hover:shadow-md hover:border-slate-300 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        ) : (
          <>
            <GoogleIcon />
            <span>S&apos;inscrire avec Google (Compte vérifié)</span>
          </>
        )}
      </button>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
          ou formulaire classique
        </span>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nom complet
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            placeholder="Ex: Baye Ndiaye"
          />
        </div>

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
            <div className="mt-1 space-y-1">
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{emailError}</span>
              </p>
              {emailSuggestion && (
                <button
                  type="button"
                  onClick={() => applySuggestion(emailSuggestion)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Corriger automatiquement en : {emailSuggestion}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Mot de passe
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            placeholder="•••••••• (minimum 6 caractères)"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Confirmer le mot de passe
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            placeholder="Confirmez votre mot de passe"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-3.5 flex items-center justify-center space-x-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md shadow-slate-900/20 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Créer mon compte</span>
            </>
          )}
        </button>

        <div className="text-center text-xs font-medium text-slate-500 mt-4">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all">
            Connectez-vous
          </Link>
        </div>
      </form>
    </div>
  );
};
