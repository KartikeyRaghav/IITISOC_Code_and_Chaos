import React from "react";
import { Sparkles, Rocket, Zap } from "lucide-react";

const AppIntro = () => {
  return (
    <section className="relative w-full flex flex-col items-center justify-center bg-gradient-to-r from-[#004466]/95 via-[#1a365d]/95 to-[#6a00b3]/95 p-6 sm:p-8 shadow-2xl min-h-[300px] lg:min-h-full overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-10 animate-float">
        <Sparkles className="w-6 h-6 text-purple-300/60" />
      </div>
      <div className="absolute top-32 right-16 animate-float-delayed">
        <Rocket className="w-8 h-8 text-blue-300/60" />
      </div>
      <div className="absolute bottom-32 left-20 animate-bounce-slow">
        <Zap className="w-7 h-7 text-purple-400/60" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo with Enhanced Effects */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <img
            src="/logos/logo_transparent.png"
            alt="IGNITIA Logo"
            className="relative w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full shadow-2xl border-4 border-white/20 backdrop-blur-sm transition-transform duration-500 hover:scale-105 hover:rotate-3"
          />
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full opacity-20 blur-md animate-spin-slow"></div>
        </div>

        {/* Title with Enhanced Typography */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-2xl leading-tight">
            Ignite your web presence with{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#00d4ff] via-[#0099ff] to-[#9a00ff] bg-clip-text text-transparent animate-gradient-x">
                IGNITIA
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 blur-sm opacity-30 animate-pulse"></div>
            </span>
          </h1>

          {/* Subtitle with Better Spacing */}
          <div className="space-y-2">
            <p className="text-lg sm:text-xl lg:text-2xl text-purple-100/90 font-medium">
              From commit to cloud
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-blue-200 font-semibold bg-white/5 backdrop-blur-sm rounded-full px-6 py-2 border border-white/10">
              Effortless Project Launches, Every Time.
            </p>
          </div>
        </div>

        {/* Call to Action Hint */}
        <div className="flex items-center gap-2 text-purple-200/70 text-sm animate-bounce-gentle">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
          <span>Scroll down to get started</span>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping delay-500"></div>
        </div>
      </div>
    </section>
  );
};

export default AppIntro;
