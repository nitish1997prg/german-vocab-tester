import { notFound } from "next/navigation";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const enabled =
    process.env.NODE_ENV === "development" &&
    process.env.AUTH_OTP_ENABLED === "true";

  if (!enabled) {
    notFound();
  }

  return <LoginForm />;
}