'use client'
import React from 'react'

const UniqueVisitorsCard = () => {
    return (
        <div className='mt-8 bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 flex items-center justify-center gap-6 backdrop-blur-sm text-white'>
            <div className='flex flex-col items-center text-center'>
                <div className='text-5xl font-extrabold text-blue-400 mb-2'>
                    {count ?? "--"}
                </div>
                <div className='text-lg font-semibold text-purple-300 uppercase tracking-wider'>
                    Unique Visitors 
                </div>
                <div className='h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-3'></div>
            </div>
        </div>
    )
}

export default UniqueVisitorsCard