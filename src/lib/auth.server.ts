import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import 'dotenv/config';

const resend = new Resend(RESEND_API_KEY);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'manager',
        required: true
      }
    }
  },
  basePath: '/auth',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:5173',
  trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      try {
        const { data, error } = await resend.emails.send({
          from: 'IBZN <onboarding@resend.dev>', //tem que trocar esse email dps la no resend quando tiver o dominio
          to: [user.email],
          subject: 'Redefinir sua senha',
          html: /* trocar isso dps */` 
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Redefinição de senha</h2>
              <p style="color: #666; line-height: 1.6;">Olá,</p>
              <p style="color: #666; line-height: 1.6;">
                Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" 
                   style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Redefinir senha
                </a>
              </div>
              <p style="color: #666; line-height: 1.6;">
                Ou copie e cole este link no seu navegador:
              </p>
              <p style="color: #007bff; word-break: break-all; font-size: 14px;">
                ${url}
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              <p style="color: #999; font-size: 12px;">
                Se você não solicitou esta redefinição, ignore este e-mail. O link expira em 1 hora.
              </p>
            </div>
          `,
        });

        if (error) {
          console.error('Erro ao enviar email:', error);
          throw new Error(`Falha ao enviar email: ${error.message}`);
        }

        console.log('Email de reset enviado com sucesso:', data);
      } catch (error) {
        console.error('Erro no envio do email:', error);
        throw error;
      }
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!
});