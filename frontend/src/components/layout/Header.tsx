import Image from "next/image";

export default function Header() {
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
