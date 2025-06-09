import React from "react";
import { GridBackground } from "./ui/GridBackground";
import { Spotlight } from "./ui/Spotlight";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden">
      <GridBackground className="absolute -top-1/2 -left-1/2 inset-0 z-0 opacity-30">
        <div className="z-10 flex flex-col items-center justify-center h-fit text-white px-4 text-center">
          <Image
            src="/logos/logo_transparent.png"
            alt="Logo"
            width={128}
            height={128}
            className="mb-6 rounded-full object-contain"
          />
        </div>
      </GridBackground>

      <div className="inset-0 z-10">
        <Spotlight
          className="absolute top-1/2 left-1/2 -translate-x-[65%] -translate-y-[80%] h-[70vh] w-[70vw] sm:w-[50vw] sm:h-[50vh] opacity-40"
          fill="blue"
        />
        <Spotlight
          className="absolute top-1/2 left-1/2 -translate-x-[50%] -translate-y-[85%] h-[70vh] w-[70vw] sm:w-[40vw] sm:h-[40vh] opacity-60"
          fill="purple"
        />
        <Spotlight
          className="absolute top-1/2 left-1/2 -translate-x-[35%] -translate-y-[85%] h-[70vh] w-[70vw] sm:w-[60vw] sm:h-[60vh] opacity-50"
          fill="blue"
        />
      </div>
    </div>
  );
};

export default Hero;
