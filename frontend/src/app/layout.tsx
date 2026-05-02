import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cubos Movies",
  description: "Aplicação de filmes do desafio técnico Cubos.",
};

function Header() {
  return (
    <header className="glass-header">
      <div className="flex h-[72px] items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Image
            src="/assets/logo.png"
            alt="Cubos Movies"
            width={121}
            height={24}
            style={{ width: "121px", height: "auto" }}
            className="hidden sm:block"
            priority
          />
          <Image
            src="/Vector.png"
            alt="Cubos Movies Icon"
            width={35}
            height={35}
            className="sm:hidden"
            priority
          />
          <span
            className="text-center font-bold leading-none"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "20px",
              fontWeight: 700,
              color: "#EEEEF0",
              width: "71px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Movies
          </span>
        </div>
        <div className="flex h-[44px] w-[162px] items-center gap-2">
          <button
            type="button"
            aria-label="Alternar tema"
            className="flex h-[44px] min-h-[44px] w-[64px] items-center justify-center rounded-[2px] border border-none px-5 backdrop-blur-[4px] transition-colors"
            style={{ backgroundColor: "#B744F714" }}
          >
            <Image
              src="/svgs/Sun_fill.svg"
              alt="Sun icon"
              width={20}
              height={20}
              style={{ filter: "invert(1)" }}
            />
          </button>
          <button
            type="button"
            className="flex h-[44px] min-h-[44px] w-[90px] items-center justify-center rounded-[2px] px-5 text-[14px] font-semibold leading-[19px] transition-colors"
            style={{ backgroundColor: "#8E4EC6", color: "#EEEEF0" }}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0f0e11] text-white">
        <div className="app-shell flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
