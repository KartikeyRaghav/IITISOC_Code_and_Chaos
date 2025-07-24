import React from 'react'

const AppIntro = () => {
    return (
        <section className='w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#003047] to-[#37005c] p-6 sm:p-8 shadow-lg min-h-[300px] lg:min-h-screen'>
            <img 
                src='/logos/logo_transparent.png'
                alt='Logo'
                className='w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full shadow-2xl mb-4 border-4 border-white'
            />
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 drop-shadow-lg'>
                Ignite your web presence with{" "}
                <span className="bg-gradient-to-r from-[#005b83] via-[#0077ab] to-purple-500 bg-clip-text text-transparent">IGNITIA</span>
            </h1>
            <p className='text-sm sm:text-base lg:text-lg text-purple-100 mb-4 text-center max-w-xl'>From commit to cloud<br/>
            <span className='text-blue-200 font-semibold'> Effortless Project Launches, Every Time.</span>
            </p>
        </section>
    )
}

export default AppIntro;
