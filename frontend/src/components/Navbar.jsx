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
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b border-gray-700 backdrop-blur-md shadow-sm bg-black/60 ${
        openNavigation ? "bg-n-8" : "bg-black backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex items-center justify-between py-4 px-6">
        <nav className="hidden mx-auto lg:flex gap-10">
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className={`text-base font-semibold transition-colors ${
                pathname === item.url
                  ? "text-white underline underline-offset-4"
                  : "text-white hover:text-[#003D5C] hover:drop-shadow-md"
              }`}
            >
              {item.title}
            </a>
          ))}
        </nav>

        <button
          onClick={toggleNavigation}
          className="p-3 ml-auto text-white border-none outline-none bg-transparent lg:hidden text-2xl"
        >
          {openNavigation ? "✖" : "☰"}
        </button>
      </div>
      {openNavigation && (
        <nav className="flex flex-col items-center mt-6 space-y-6 lg:hidden bg-black py-6">
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={item.url}
              onClick={handleClick}
              className="block text-white text-2xl font-semibold hover:text-[#003D5C]"
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
