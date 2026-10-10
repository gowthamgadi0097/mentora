import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Background from "@/components/Background";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Mentora | Your AI mentor for smarter learning",
  description: "Mentora brings an AI tutor, quiz generator, notes summarizer and study planner together in one place.",
};

// Applies the saved theme before first paint to avoid a colour flash.
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="aurora" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <Background />
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
