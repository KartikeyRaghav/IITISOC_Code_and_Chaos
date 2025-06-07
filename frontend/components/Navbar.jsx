'use client';
import { navigation } from '../constants';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {disablePageScroll, enablePageScroll} from 'scroll-lock';

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
            className={`fixed left-0 w-full z-50 px-4 py-3 border-b border-white lg:bg-black lg:backdrop-blur-sm ${
                openNavigation ? "bg-n-8" : "bg-black backdrop-blur-sm"
            }`}
        >

            <div className='flex items-center justify-between'>

                <nav className='hidden lg:flex justify-between w-full'>
                    {navigation.map((item) => (
                        <a
                            key={item.id}
                            href={item.url}
                            className={`text-sm font-semibold transition-colors ${
                                pathname === item.url
                                ? 'text-white'
                                : 'text-white hover:text-[#003D5C]'
                            }`}
                        >
                            {item.title}
                        </a>
                    ))}
                    </nav>

                    <button
                        onClick={toggleNavigation}
                        className="p-2 ml-auto text-white border-none outline-none bg-transparent lg:hidden"
                    >
                        {openNavigation ? '✖' : '☰'}
                    </button>
            </div>
                {openNavigation && (
                    <nav className="flex flex-col items-center mt-4 space-y-4 lg:hidden bg-black py-4">
                        {navigation.map((item) => (
                            <a
                                key={item.id}
                                href={item.url}
                                onClick={handleClick}
                                className="text-white text-xl hover:text-[#003D5C]"
                            >
                                {item.title}
                            </a>
                        ))}
                    </nav>
                )}
        </div>
    )
}

export default Navbar