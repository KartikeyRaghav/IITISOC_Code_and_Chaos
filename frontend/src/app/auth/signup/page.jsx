'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import ProfileUpload from '../../../../components/ProfileUpload';

export default function SignupPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r to-[#001b29] from-[#000E14] p-4">
            <div className="bg-black p-8 rounded-2xl shadow-md w-full max-w-sm space-y-4">
                <h2 className="text-2xl font-bold text-center">Signup Form</h2>

                <div className="flex justify-between bg-gray-100 rounded-full overflow-hidden">
                    <button
                        className="w-1/2 text-gray-700 py-2 cursor-pointer"
                        onClick={() => router.push('/auth/login')}
                    >
                        Login
                    </button>
                    <button className="w-1/2 bg-gradient-to-r to-[#00628d] from-[#003047] text-white py-2">Signup</button>
                </div>

                <input
                    type="text"
                    placeholder="Name"
                    className="w-full px-4 py-2 border rounded-xl"
                />
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
                <input
                    type="username"
                    placeholder="Username"
                    className="w-full px-4 py-2 border rounded-xl"
                />

                <ProfileUpload />

                <button className="w-full py-2 bg-gradient-to-r to-[#00628d] from-[#003047] rounded-lg cursor-pointer">
                    Signup
                </button>

                <p className="text-sm text-center">
                    Already a member?{' '}
                    <span
                        onClick={() => router.push('/auth/login')}
                        className="text-[#003D5C] cursor-pointer"
                    >
                        Login now
                    </span>
                </p>
            </div>
        </div>
    );
}
