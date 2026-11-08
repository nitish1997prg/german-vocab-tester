import "server-only";

import { emailOTP } from "better-auth/plugins";

import { sendAuthEmail } from "@/lib/email/send-auth-email";

export const loginEmailOTP = emailOTP({
  otpLength: 6,

  expiresIn: 300,

  allowedAttempts: 5,

  disableSignUp: true,

  resendStrategy: "rotate",

  storeOTP: "encrypted",

  async sendVerificationOTP({ email, otp, type }) {
    if (type !== "sign-in") {
      throw new Error("Unsupported OTP purpose");
    }

    await sendAuthEmail({
      to: email,
      subject: "Your German Vocabulary Tester login code",
      text: [
        `Your verification code is: ${otp}`,
        "",
        "This code expires in 5 minutes.",
        "",
        "If you did not request this code, ignore this email.",
      ].join("\n"),
    });
  },
});