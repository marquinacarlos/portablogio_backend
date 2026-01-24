import { Request, Response } from 'express';
import { Resend } from 'resend';

// Inicializar Resend con API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email destino (tu correo)
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'contacto@carlosmarquina.dev';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export class ContactController {
  static async sendMessage(req: Request, res: Response) {
    try {
      const { name, email, subject, message }: ContactFormData = req.body;

      // Validaciones basicas
      if (!name || !email || !subject || !message) {
        return res.status(400).json({
          error: 'Todos los campos son obligatorios'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'El formato del email no es valido'
        });
      }

      // Enviar email con Resend
      const { data, error } = await resend.emails.send({
        from: 'Portfolio <onboarding@resend.dev>', // Cambiar cuando tengas dominio verificado
        to: [CONTACT_EMAIL],
        replyTo: email,
        subject: `[Portfolio] ${subject}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333; border-bottom: 2px solid #06b6d4; padding-bottom: 10px;">
              Nuevo mensaje desde el portfolio
            </h2>

            <div style="margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Nombre:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 5px 0;"><strong>Asunto:</strong> ${subject}</p>
            </div>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #555;">Mensaje:</h3>
              <p style="white-space: pre-wrap; color: #333;">${message}</p>
            </div>

            <p style="color: #888; font-size: 12px; margin-top: 30px;">
              Este mensaje fue enviado desde el formulario de contacto de tu portfolio.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error('Error enviando email:', error);
        return res.status(500).json({
          error: 'Error al enviar el mensaje. Intenta de nuevo mas tarde.'
        });
      }

      console.log('Email enviado:', data?.id);

      res.json({
        message: 'Mensaje enviado correctamente',
        id: data?.id
      });

    } catch (error) {
      console.error('Error en ContactController:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
}
