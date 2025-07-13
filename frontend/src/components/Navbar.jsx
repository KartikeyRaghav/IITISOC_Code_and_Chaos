import React, { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";
import { navLinks } from "@/constants";

const Navbar = () => {
  const [openNavigation, setOpenNavigation] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("/");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Simulate pathname - replace with actual usePathname() hook
  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  const toggleNavigation = () => {
    setOpenNavigation(!openNavigation);
    // Replace with your scroll-lock implementation
    if (!openNavigation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;
    setOpenNavigation(false);
    document.body.style.overflow = "unset";
  };

  const handleLinkClick = (url) => {
    setActiveLink(url);
    handleClick();
  };

  return (
    <>
      {/* Backdrop overlay for mobile menu */}
      {openNavigation && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleClick}
        />
      )}

      <div
        className={`fixed top-0 z-50 w-full transition-all duration-500 ease-out ${
          scrolled || openNavigation
            ? "bg-gradient-to-r from-[#004466]/95 via-[#1a365d]/95 to-[#6a00b3]/95 backdrop-blur-xl shadow-2xl border-b border-purple-500/20"
            : "bg-gradient-to-r from-[#004466]/80 via-[#1a365d]/80 to-[#6a00b3]/80 backdrop-blur-md border-b border-purple-500/10"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <div className="flex items-center gap-3 z-50">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-110">
              <img
                src={"/logos/logo_rounded.png"}
                className="w-10 h-10 text-white"
              />
            </div>
            <span className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
              Ignitia
            </span>
          </div>

          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((item, index) => (
              <a
                key={item.id}
                href={item.url}
                onClick={() => handleLinkClick(item.url)}
                className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  activeLink === item.url
                    ? "bg-gradient-to-r from-[#00aaff]/20 to-[#9a00ff]/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/10"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {item.icon}
                <span className="relative">
                  {item.title}
                  {activeLink === item.url && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                  )}
                </span>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </a>
            ))}
          </nav>

          <button
            onClick={toggleNavigation}
            className="lg:hidden relative w-12 h-12 bg-gradient-to-br from-[#00aaff]/20 to-[#9a00ff]/20 rounded-xl border border-purple-500/30 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25 z-50"
          >
            <div className="relative w-6 h-6">
              <Menu
                className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                  openNavigation
                    ? "opacity-0 rotate-180 scale-0"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <X
                className={`absolute inset-0 w-6 h-6 transition-all duration-300 ${
                  openNavigation
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-180 scale-0"
                }`}
              />
            </div>
          </button>
        </div>

        <div
          className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-500 ease-out ${
            openNavigation
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] border-t border-purple-500/20 shadow-2xl">
            <nav className="flex flex-col p-6 space-y-2 max-h-[calc(100vh-100px)] overflow-y-auto">
              {navLinks.map((item, index) => (
                <a
                  key={item.id}
                  href={item.url}
                  onClick={() => handleLinkClick(item.url)}
                  className={`group flex items-center gap-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                    activeLink === item.url
                      ? "bg-gradient-to-r from-[#00aaff]/20 to-[#9a00ff]/20 text-white border border-purple-500/30 shadow-lg shadow-purple-500/20"
                      : "text-gray-300 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-white/10"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: openNavigation
                      ? "slideInFromRight 0.3s ease-out forwards"
                      : "none",
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      activeLink === item.url
                        ? "bg-gradient-to-br from-[#00aaff] to-[#9a00ff] shadow-lg"
                        : "bg-gray-700/50 group-hover:bg-gradient-to-br group-hover:from-[#00aaff]/50 group-hover:to-[#9a00ff]/50"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-lg">{item.title}</span>

                  {/* Active indicator */}
                  {activeLink === item.url && (
                    <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" />
                  )}
                </a>
              ))}
            </nav>

            {/* Mobile menu footer */}
            <div className="px-6 py-4 border-t border-gray-700/50">
              <div className="text-center text-gray-400 text-sm">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                  Ignitia
                </span>{" "}
                - Ignite your web presence.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
