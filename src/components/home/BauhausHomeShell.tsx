
import type { ReactNode } from "react";
import Link from "next/link";

import BauhausHeader from "./BauhausHeader";
import { jakarta } from "@/lib/fonts";

type Props = {
  children: ReactNode;
  navigation?: ReactNode;
};

export default function BauhausHomeShell({
  children,
  navigation,
}: Props) {
  return (
    <div
      className={`${jakarta.className}
        relative isolate min-h-dvh overflow-x-hidden
        bg-[var(--wm-canvas)]
        text-[var(--wm-text)]`}
    >
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute
                   left-1/2 top-0 -z-10
                   h-80 w-80 -translate-x-1/2
                   rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative mx-auto flex min-h-dvh
                   w-full max-w-md flex-col px-5
                   pt-6 pb-5"
      >
        <div className="mb-5 empty:hidden">
          {navigation}
        </div>
        <BauhausHeader />

        {/* Home content — vertically balanced */}
        <div className="mt-4 flex flex-1 flex-col">
          <div className="my-auto py-4">
            {children}
          </div>
        </div>
        {/* Footer */}
        <footer
          className="mt-7 flex items-center
                     justify-between gap-3 border-t
                     border-[var(--wm-border)]
                     pt-4 text-[11px] text-gray-400"
        >
          <Link
            href="/privacy"
            className="underline underline-offset-4
                       hover:text-[var(--wm-amber)]"
          >
            Privacy Policy
          </Link>

          <span>No account required</span>
        </footer>
      </div>
    </div>
  );
}
