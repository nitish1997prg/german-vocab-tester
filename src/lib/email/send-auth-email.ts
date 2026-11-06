import "server-only";

import { Resend } from "resend";

type SendAuthEmailParams = {
  to: string;
  subject: string;
  text: string;
};

export async function sendAuthEmail({
  to,
  subject,
  text,
}: SendAuthEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.AUTH_EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Resend email configuration is missing");
  }

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
  });

  if (error) {
    throw new Error(`Email delivery request failed: ${error.message}`);
  }

  return data?.id ?? null;
}