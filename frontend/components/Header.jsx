'use client'
import { Playfair_Display } from 'next/font/google' //font for 'Ignitia'
import { useRouter } from 'next/navigation';
import React from 'react'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'], 
})

const Header = () => {

  const router = useRouter()

  return (
    <div className='flex items-center justify-between px-4 py-2'>
      <div className={`
        text-4xl mb-1.5 ml-4 ${
          playfair.className
        }`}
      >
        Ignitia
      </div>

      <button 
        className="px-4 py-2 bg-[#002233] text-white rounded-full hover:bg-[#003047] cursor-pointer"
        onClick={
          () => {
            router.push('/auth/login')
          }
        }
      >
        Login
      </button>

    </div>
  );
};

export default Header