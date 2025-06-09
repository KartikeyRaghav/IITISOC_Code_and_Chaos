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
          className="px-3 py-1.5 text-xs sm:text-sm md:text-base bg-[#002233] text-white rounded-full hover:bg-[#003047] hover:scale-105 active:scale-95 transition duration-300 cursor-pointer"
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
