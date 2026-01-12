import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-5xl place-items-center px-4 py-10">
      {children}
    </div>
  );
}
