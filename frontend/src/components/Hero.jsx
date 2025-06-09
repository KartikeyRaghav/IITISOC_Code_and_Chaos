"use client"
import React from "react";
import { GridBackground } from "./ui/GridBackground";
import { Spotlight } from "./ui/Spotlight";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 text-center overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none">
        
        <GridBackground className="w-full h-full opacity-60 mix-blend-screen" />
        
        
        <Spotlight
          className="absolute top-1/2 left-1/2 -translate-x-[65%] -translate-y-[80%] h-[70vh] w-[70vw] sm:w-[50vw] sm:h-[50vh] opacity-90 mix-blend-lighten"
          fill="blue"
        />
        <Spotlight
          className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[85%] h-[70vh] w-[70vw] sm:w-[40vw] sm:h-[40vh] opacity-95 mix-blend-lighten"
          fill="purple"
        />
        <Spotlight
          className="absolute top-1/2 left-1/2 -translate-x-[35%] -translate-y-[85%] h-[70vh] w-[70vw] sm:w-[60vw] sm:h-[60vh] opacity-80 mix-blend-lighten"
          fill="blue"
        />
        
        <div className="absolute inset-0 bg-black opacity-80"></div>
      </div>

      
      <div className="relative z-10 max-w-3xl flex flex-col items-center">
        <Image
          src="/logos/logo_transparent.png"
          alt="IGNITIA Logo"
          width={500}
          height={500}
          className="mb-8 rounded-full object-contain -translate-y-30"
          priority
        />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 -translate-y-70">
          Welcome to <span className="bg-gradient-to-r from-[#005b83] via-[#0077ab] to-purple-500 bg-clip-text text-transparent">IGNITIA</span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-xl -translate-y-70">
          Ignite Your Web Presence.
        </p>
        <button 
          className="px-8 py-3 rounded-full font-semibold text-lg shadow-lg bg-gradient-to-r from-[#003047] via-[#00aaff] to-[#9a00ff] text-white transition duration-200 hover:scale-105 hover:shadow-xl hover:from-[#003d5c] hover:via-[#14b3ff] hover:to-[#8a00e6] focus:outline-none focus:ring-4 focus:ring-[#00aaff]/40 -translate-y-65"
          onClick={() => {
            router.push("auth/signup");
          }}
        >
          Get Started
        </button>

      </div>
    </section>
  );
};

export default Hero;
