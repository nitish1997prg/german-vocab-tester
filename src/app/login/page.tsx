import { notFound, redirect } from "next/navigation";

import { getCurrentSession } from "@/lib/auth-session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const enabled =
    process.env.NODE_ENV === "development" &&
    process.env.AUTH_OTP_ENABLED === "true";

  if (!enabled) {
    notFound();
  }

  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/");
  }

  return <LoginForm />;
}