import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const greeting = name ? `Bonjour ${name},` : 'Bonjour,';

    const gmailUser = process.env.GMAIL_EMAIL;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    // Si les identifiants Gmail sont configurés et différents des placeholders
    if (gmailUser && gmailAppPassword && gmailUser !== 'votre_adresse_gmail_ici@gmail.com') {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
        });

        const mailOptions = {
          from: `"L'équipe Vando" <${gmailUser}>`,
          to: email,
          subject: "Bienvenue sur Vando 🎉",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 540px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; width: 48px; height: 48px; background-color: #2563eb; color: #ffffff; border-radius: 50%; line-height: 48px; font-size: 24px; font-weight: 900;">V</div>
                <h1 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 12px 0 4px 0;">Bienvenue sur Vando 🎉</h1>
              </div>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 12px;">${greeting}</p>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 12px;">Bienvenue sur Vando.</p>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 12px;">Votre compte a été créé avec succès.</p>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">Vous pouvez dès maintenant gérer vos produits, clients, commandes et ventes.</p>
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 24px;">Merci de faire confiance à Vando.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 13px; color: #64748b; margin: 0;">L'équipe Vando</p>
            </div>
          `,
          text: `
${greeting}

Bienvenue sur Vando.
Votre compte a été créé avec succès.
Vous pouvez dès maintenant gérer vos produits, clients, commandes et ventes.
Merci de faire confiance à Vando.

L'équipe Vando
          `.trim(),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail de bienvenue envoyé avec succès:', info.messageId);
        return NextResponse.json({ success: true, messageId: info.messageId });
      } catch (mailError) {
        console.warn('Erreur envoi email réel Gmail (fallback simulation):', mailError);
      }
    }

    // Simulation d'envoi automatique si credentials non configurés
    console.log(`[Email de bienvenue automatique]`);
    console.log(`Destinataire: ${email}`);
    console.log(`Objet: Bienvenue sur Vando 🎉`);
    console.log(`Contenu: Bienvenue sur Vando. Votre compte a été créé avec succès. Vous pouvez dès maintenant gérer vos produits, clients, commandes et ventes. Merci de faire confiance à Vando.`);

    return NextResponse.json({ success: true, simulated: true });
    
  } catch (error) {
    console.error('Erreur lors du traitement de l\'e-mail de bienvenue:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
