import "./globals.css";
import { ReactNode } from "react";
import { CyberBackground } from "@/components/CyberBackground";

export const metadata = {
  title: "PhishQuest — AI Phishing Quiz",
  description: "เกมฝึกจับ Phishing โดย AI สร้างโจทย์ไม่ซ้ำ พร้อมคำอธิบายทุกข้อ"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen text-slate-100 antialiased">
        <CyberBackground />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
