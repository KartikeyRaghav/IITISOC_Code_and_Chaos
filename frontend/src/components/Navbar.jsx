"use client";
import { navLinks } from "@/constants";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

const Navbar = () => {
  const pathname = usePathname();
  const [openNavigation, setOpenNavigation] = useState(false);

  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;

    enablePageScroll();
    setOpenNavigation(false);
  };

  return (
    <div
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b border-gray-700 backdrop-blur-md shadow-sm ${
        openNavigation ? "bg-black" : "bg-black/70 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between py-2 sm:py-3 px-4 sm:px-6">
        <nav className="hidden sm:gap-10 lg:flex gap-10">
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className={`text-sm sm:text-base font-medium transition transform duration-200 ease-in-out ${
                pathname === item.url
                  ? "text-white underline underline-offset-4"
                  : "text-white hover:text-custom-blue-100 hover:scale-105 hover:-translate-y[2px] hover:drop-shadow"
              }`}
            >
              {item.title}
            </a>
          ))}
        </nav>

        <button
          onClick={toggleNavigation}
          className="p-2 sm:p-3 ml-auto text-white border-none outline-none bg-transparent lg:hidden text-xl"
        >
          {openNavigation ? "✖" : "☰"}
        </button>
      </div>
      {openNavigation && (
        <nav className="flex flex-col items-center space-y-6 lg:hidden bg-black px-4 py-6 h-[calc(100vh-64px)] overflow-y-auto scrollbar-thin scrollbar-thumb-custom-blue-100 scrollbar-track-transparent">
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              onClick={handleClick}
              className="block text-white text-lg font-medium transition transform duration-200 ease-in-out hover:text-custom-blue-100 hover:scale-105 hover:-translate-y-[2px] hover:drop-shadow"
            >
              {item.title}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
};
export default Navbar;
