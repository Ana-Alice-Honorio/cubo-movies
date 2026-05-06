"use client";

import Image from "next/image";
import { Button } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

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
            src="/assets/Vector.png"
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
        <div className="flex h-[44px] items-center gap-2">
          <button
            type="button"
            aria-label="Alternar tema"
            className="flex h-[44px] min-h-[44px] w-[64px] items-center justify-center rounded-[2px] border border-none px-5 backdrop-blur-[4px] transition-colors cursor-pointer"
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
          {user && (
            <Button variant="primary" onClick={handleLogout} className="cursor-pointer">
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
