import {Mail,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
} from 'lucide-react';

export default function ResetPasswordPage() {
    return (
        <div className='min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3] flex items-center justify-center p-4'>
            <div className='absolute inset-0 overflow-hidden'>
                <div className='absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl'></div>
                <div className='absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl'></div>
                <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl'></div>
            </div>

            <div className='relative bg-gradient-to-br from-[#23243a] to-[#1a1b2e] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-purple-500/20 backdrop-blur-sm z-10'>
            
            <div className='text-center mb-8'>
                <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-4 shadow-lg'>
                    <Lock className='w-8 h-8 text-white'/>
                </div>
                <h2 className='text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text'>
                    Reset Password
                </h2>
                <p className='text-gray-400'>Enter your new password below</p>
            </div>

            <form className='space-y-6'>
                
                <div className='space-y-2'>
                    <label className='text-gray-300 font-medium text-sm flex items-center gap-2'>
                        <Lock className='w-4 h-4 text-purple-400'/>
                        New Password 
                    </label>
                    <div className='relative'>
                        <input 
                            type='password'
                            placeholder='Enter your new password'
                            className='w-full p-4 pl-12 pr-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 background-blur-sm'
                            disabled 
                        />
                        <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'/>
                        <button
                            type='button'
                            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400'
                            disabled 
                        >
                            <EyeOff className='w-5 h-5'/>
                        </button>
                    </div>
                </div>

                <div className='space-y-2'>
                    <label className='text-gray-300 font-medium text-sm flex items-center gap-2'>
                        <Lock className='w-4 h-4 text-yellow-400'/>
                        Confirm New Password 
                    </label>
                    <div className='relative'>
                        <input 
                            type='password'
                            placeholder='Confirm your new password'
                            className='w-full p-4 pl-12 pr-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 background-blur-sm'
                            disabled 
                        />
                        <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'/>
                        <button
                            type='button'
                            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400'
                            disabled 
                        >
                            <EyeOff className='w-5 h-5'/>
                        </button>
                    </div>
                </div>

                <button
                    type='button'
                    className='w-full py-4 rounded-xl font-bold text-lg shadow-xl bg-gradient-to-r from-[#00aaff] via-[#0099ff] to-[#9a00ff] text-white mt-2 flex items-center justify-center gap-3 opacity-60 cursor-not-allowed'
                    disabled 
                >
                    <Lock className='w-6 h-6'/>
                    Reset Password 
                </button>
            </form>

            <div className='mt-8 text-center'>
                <p className='text-gray-400 text-sm'>
                    Remember your password?{" "}
                    <span className='text-blue-400 font-semibold cursor-pointer'>
                        Login 
                    </span>
                </p>
            </div>
            </div>
        </div>
    )
}