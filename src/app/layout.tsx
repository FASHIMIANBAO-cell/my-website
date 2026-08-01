import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClientLayout } from "@/components/client-layout";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "SangYu",
  description: "个人网站",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={geist.variable}>
      <body className="bg-black text-white antialiased">
        {/* 全局视频背景 — 切换页面时保持不动 */}
        <div className="video-bg">
          <video autoPlay muted loop playsInline preload="auto">
            <source src="/bg.mp4" type="video/mp4" />
          </video>
        </div>

        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
