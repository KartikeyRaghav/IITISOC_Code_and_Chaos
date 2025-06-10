"use client";
import ProfileUpload from "@/components/ProfileUpload";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.replace("/");
      } else {
        setError(data?.message || "Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err.message);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r to-custom-blue-600 from-custom-blue-950 p-4">
      <div className="bg-black p-8 rounded-2xl shadow-md w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center">Signup Form</h2>

        <div className="flex justify-between bg-gray-100 rounded-full overflow-hidden">
          <button
            className="w-1/2 text-gray-700 py-2 cursor-pointer"
            onClick={() => router.push("/auth/login")}
          >
            Login
          </button>
          <button className="w-1/2 bg-gradient-to-r to-custom-blue-50 from-custom-blue-300 text-white py-2">
            Signup
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSignup}>
          <input
            name="fullName"
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-xl"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded-xl"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-xl"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded-xl"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <ProfileUpload />

          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r to-custom-blue-50 from-custom-blue-300 rounded-lg cursor-pointer"
          >
            Signup
          </button>
        </form>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <p className="text-sm text-center">
          Already a member?{" "}
          <span
            onClick={() => router.push("/auth/login")}
            className="text-custom-blue-50 font-bold cursor-pointer"
          >
            Login now
          </span>
        </p>
      </div>
    </div>
  );
}
