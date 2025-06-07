'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function LoginPage() {
    const router = useRouter();

    return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#001b29] to-[#000E14] p-4">
        <div className="bg-black p-8 rounded-2xl shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center">Login Form</h2>

        <div className="flex justify-between bg-gray-100 rounded-full overflow-hidden">
            <button className="w-1/2 bg-gradient-to-r from-[#00628d] to-[#003047] text-white py-2">Login</button>
            <button
                className="w-1/2 text-gray-700 py-2 cursor-pointer"
                onClick={() => router.push('/auth/signup')}
            >
                Signup
            </button>
        </div>

        <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-xl"
        />
        <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-xl"
        />

        <p className="text-right text-sm text-[#003D5C] cursor-pointer">
            Forgot password?
        </p>

        <button className="w-full py-2 bg-gradient-to-r from-[#00628d] to-[#003047] text-white rounded-lg">
            Login
        </button>

        <p className="text-sm text-center">
            Not a member?{' '}
            <span
                onClick={() => router.push('/auth/signup')}
                className="text-[#003D5C] cursor-pointer"
            >
                Signup now
            </span>
        </p>
        </div>
    </div>
    );
}