
import { z } from "zod";

// Email address used consistently across auth flows.
export const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254, "Email address is too long");

// Supports names with spaces, accents and
// international characters.
const FirstNameSchema = z
  .string()
  .trim()
  .min(1, "First name is required")
  .max(60, "First name is too long");

const LastNameSchema = z
  .string()
  .trim()
  .max(60, "Last name is too long")
  .optional()
  .transform((value) => value || undefined);

export const AuthFlowSchema = z.enum([
  "registration",
  "login",
]);

// Start registration.
export const RegisterSchema = z
  .object({
    firstName: FirstNameSchema,
    lastName: LastNameSchema,
    email: EmailSchema,
  })
  .strict();

// Request a login OTP.
export const LoginSchema = z
  .object({
    email: EmailSchema,
  })
  .strict();

// Verify a six-digit code.
export const VerifyOtpSchema = z
  .object({
    flow: AuthFlowSchema,
    email: EmailSchema,
    code: z
      .string()
      .regex(
        /^\d{6}$/,
        "Enter a valid 6-digit code"
      ),
  })
  .strict();

// Request a replacement code.
export const ResendOtpSchema = z
  .object({
    flow: AuthFlowSchema,
    email: EmailSchema,
  })
  .strict();

export type RegisterInput = z.infer<
  typeof RegisterSchema
>;

export type LoginInput = z.infer<
  typeof LoginSchema
>;

export type VerifyOtpInput = z.infer<
  typeof VerifyOtpSchema
>;

export type ResendOtpInput = z.infer<
  typeof ResendOtpSchema
>;
