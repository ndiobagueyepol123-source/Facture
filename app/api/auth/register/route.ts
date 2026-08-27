import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pool } from '@/lib/db';
import { promises as dnsPromises } from 'dns';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Détection des fautes de frappe courantes
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

// Domaines temporaires / jetables interdits
const DISPOSABLE_DOMAINS = [
  'tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
  'throwawaymail.com', 'yopmail.com', 'trashmail.com', 'sharklasers.com',
  'dispostable.com', 'fakeinbox.com', 'getairmail.com'
];

async function verifyEmailDomain(email: string): Promise<{ valid: boolean; error?: string }> {
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: "Format d'adresse e-mail invalide." };
  }
  const domain = parts[1].toLowerCase();

  if (DOMAIN_TYPOS[domain]) {
    return {
      valid: false,
      error: `Attention à la faute de frappe dans votre adresse (@${domain}). Vouliez-vous dire @${DOMAIN_TYPOS[domain]} ?`,
    };
  }

  if (DISPOSABLE_DOMAINS.includes(domain)) {
    return {
      valid: false,
      error: "Les adresses e-mails temporaires ou jetables ne sont pas autorisées. Veuillez utiliser une adresse e-mail réelle.",
    };
  }

  // Vérification de l'existence des enregistrements DNS MX du domaine
  try {
    const mxRecords = await dnsPromises.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        error: `Le domaine @${domain} ne possède pas de serveur de messagerie valide pour recevoir des e-mails.`,
      };
    }
  } catch (dnsErr: any) {
    return {
      valid: false,
      error: `Le domaine @${domain} n'existe pas ou ne peut pas recevoir d'e-mails. Veuillez renseigner une adresse existante.`,
    };
  }

  return { valid: true };
}

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = password || '';
    const cleanName = (fullName || '').trim();

    // 1. Validation du format de l'adresse e-mail
    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Veuillez entrer une adresse e-mail valide (ex: nom@gmail.com)." },
        { status: 400 }
      );
    }

    // 2. Vérification de l'existence réelle du domaine (DNS MX) et anti-fautes de frappe
    const domainCheck = await verifyEmailDomain(cleanEmail);
    if (!domainCheck.valid) {
      return NextResponse.json(
        { error: domainCheck.error },
        { status: 400 }
      );
    }

    // 3. Validation de la longueur du mot de passe
    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit comporter au moins 6 caractères." },
        { status: 400 }
      );
    }

    // 3. Vérification de l'existence préalable dans la base Supabase
    try {
      const existingUserRes = await pool.query(
        'SELECT id FROM auth.users WHERE LOWER(email) = $1 LIMIT 1',
        [cleanEmail]
      );

      if (existingUserRes.rows.length > 0) {
        return NextResponse.json(
          { error: "Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse." },
          { status: 400 }
        );
      }
    } catch (dbCheckErr) {
      console.warn("DB check non-bloquant:", dbCheckErr);
    }

    // 4. Création du compte via Supabase Auth
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          full_name: cleanName || cleanEmail.split('@')[0],
          name: cleanName || cleanEmail.split('@')[0],
        },
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (
        msg.includes("already registered") ||
        msg.includes("already in use") ||
        msg.includes("user already exists")
      ) {
        return NextResponse.json(
          { error: "Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    // Détection anti-énumération Supabase (identities vide = compte déjà existant)
    if (signUpData?.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
      return NextResponse.json(
        { error: "Cette adresse e-mail est déjà utilisée. Connectez-vous ou utilisez une autre adresse." },
        { status: 400 }
      );
    }

    // 5. Désactivation de confirmation : auto-confirmation immédiate en base de données
    try {
      await pool.query(
        `UPDATE auth.users 
         SET email_confirmed_at = COALESCE(email_confirmed_at, NOW()) 
         WHERE LOWER(email) = $1`,
        [cleanEmail]
      );
    } catch (updateErr) {
      console.warn("Erreur auto-confirmation DB:", updateErr);
    }

    // 6. Envoi automatique de l'e-mail de bienvenue
    try {
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      fetch(`${protocol}://${host}/api/send-welcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: cleanName }),
      }).catch((e) => console.warn('Non-blocking welcome email trigger:', e));
    } catch (e) {
      console.warn('Welcome email error:', e);
    }

    return NextResponse.json({
      success: true,
      message: "Compte créé et confirmé avec succès",
      userId: signUpData.user?.id,
    });

  } catch (error: any) {
    console.error("Erreur d'inscription:", error);
    return NextResponse.json(
      { error: error?.message || "Une erreur est survenue lors de la création du compte." },
      { status: 500 }
    );
  }
}
