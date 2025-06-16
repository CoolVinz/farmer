import type { Metadata } from "next";
import { HydrationSafeLayout } from "@/components/HydrationSafeLayout";

// These styles apply to every route in the application
import "./globals.css";

export const metadata: Metadata = {
  title: "สวนวิสุทธิ์ศิริ - ระบบจัดการสวน",
  description: "ระบบจัดการข้อมูลต้นไม้และกิจกรรมการดูแลสวน",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-gray-50" suppressHydrationWarning>
        <HydrationSafeLayout>
          {children}
        </HydrationSafeLayout>
      </body>
    </html>
  );
}
