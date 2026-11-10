import { notFound } from "next/navigation";

import RegistrationForm from "./registration-form";

export default function RegisterPage() {
  const enabled =
    process.env.NODE_ENV === "development" &&
    process.env.AUTH_OTP_ENABLED === "true";

  if (!enabled) {
    notFound();
  }

  return <RegistrationForm />;
}