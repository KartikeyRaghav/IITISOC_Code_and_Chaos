"use client";
import { Playfair_Display } from "next/font/google"; //font for 'Ignitia'
import { useRouter } from "next/navigation";
import React from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

const Header = () => {
  const router = useRouter();

  return (
    <header className="w-full bg-black shadow-sm px-6 py-4">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div
          className={`
        text-2xl sm:text-2xl md:text-3xl tracking-tight text-white bg-clip-text ${playfair.className}`}
        >
          Ignitia
        </div>

        <button
          className="px-3 py-1.5 text-xs sm:text-sm md:text-base bg-gradient-to-r from-[#003047] via-[#00aaff] to-[#9a00ff] text-white rounded-full transition duration-200 hover:shadow-xl hover:from-[#003d5c] hover:via-[#14b3ff] hover:to-[#8a00e6] focus:outline-none focus:ring-4 focus:ring-[#00aaff]/40 cursor-pointer"
          onClick={() => {
            router.push("/auth/login");
          }}
        >
          Login
        </button>
      </div>
    </header>
  );
};

export default Header;
