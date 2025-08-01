"use client";

import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Rocket, ChevronDown, LogOut } from "lucide-react";
import { navLinks } from "@/constants";
import { usePathname, useRouter } from "next/navigation";

const Navbar = () => {
  const [openNavigation, setOpenNavigation] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("/");
  const pathName = usePathname();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const currentUser = {
    name: localStorage?.getItem("fullName") || "",
    email: localStorage?.getItem("email") || "",
    projectCount: localStorage?.getItem("count") || 0,
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveLink(pathName);
  }, []);

  const toggleNavigation = () => {
    setOpenNavigation(!openNavigation);
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

  const handleLogout = async () => {
    setShowProfileDropdown(false);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/logout`,
        { credentials: "include", method: "POST" }
      );
      if (response.ok) {
        router.replace("/auth/login");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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
        <div className="mx-auto flex items-center justify-between py-4 px-6 xl:px-24">
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

          {/* Profile Dropdown & Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Profile Dropdown - Desktop */}
            <div className="hidden lg:block relative" ref={profileDropdownRef}>
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                onMouseEnter={() => setShowProfileDropdown(true)}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#00aaff]/20 to-[#9a00ff]/20 border border-purple-500/30 text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </div>

                {/* User Name */}
                <span className="font-medium text-sm">
                  {currentUser.name.split(" ")[0]}
                </span>

                {/* Dropdown Arrow */}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${
                    showProfileDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showProfileDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-2xl shadow-2xl border border-purple-500/20 backdrop-blur-xl overflow-hidden z-50"
                  onMouseLeave={() => setShowProfileDropdown(false)}
                >
                  <div className="p-6 border-b border-gray-600/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {currentUser.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(currentUser.name)
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">
                          {currentUser.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-b border-gray-600/30">
                    <div className="bg-[#2c2f4a]/50 rounded-xl p-4 border border-gray-600/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Rocket className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-gray-300 font-medium">
                            Projects
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                          {currentUser.projectCount}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="p-4 space-y-2">
                    <button
                      onClick={() => handleLogout()}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all duration-300 group"
                    >
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                        <LogOut className="w-4 h-4 text-red-400" />
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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
        </div>

        <div
          className={`lg:hidden absolute top-full left-0 right-0 transition-all duration-500 ease-out ${
            openNavigation
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
        >
          <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] border-t border-purple-500/20 shadow-2xl">
            {/* Mobile Profile Section */}
            <div className="p-6 border-b border-gray-600/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(currentUser.name)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">
                    {currentUser.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Rocket className="w-3 h-3 text-blue-400" />
                    <span className="text-blue-400 text-xs font-medium">
                      {currentUser.projectCount} Projects
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex flex-col p-6 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
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

              {/* Mobile Logout Button */}
              <button
                onClick={() => handleLogout()}
                className="group flex items-center gap-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-[1.02] text-red-300 hover:text-red-200 hover:bg-red-500/10 mt-4 border-t border-gray-600/30 pt-6"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-red-500/20 group-hover:bg-red-500/30">
                  <LogOut className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-lg">Logout</span>
              </button>
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
