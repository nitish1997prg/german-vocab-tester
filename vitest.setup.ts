import { vi } from "vitest";

// Next.js transforms font loaders at build time; Vitest needs runtime stand-ins.
vi.mock("next/font/google", () => {
  const font = (fontFamily: string) => (options?: { variable?: string }) => ({
    className: `mock-font-${fontFamily.toLowerCase().replaceAll(" ", "-")}`,
    style: { fontFamily },
    ...(options?.variable ? { variable: options.variable } : {}),
  });

  return {
    Plus_Jakarta_Sans: font("Plus Jakarta Sans"),
    JetBrains_Mono: font("JetBrains Mono"),
    Geist: font("Geist"),
    Geist_Mono: font("Geist Mono"),
  };
});
