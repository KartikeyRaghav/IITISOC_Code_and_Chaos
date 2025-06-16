"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(""); //stored the error message to be shown

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleLogin = async (e) => {
    //function triggered when login form is submitted
    e.preventDefault(); //prevents page reload upon submitting the form
    setError(""); //clears previous error message

    try {
      const response = await fetch("http://localhost:3000/api/v1/users/login", {
        method: "POST", //POST request to backend API, tells server that we are sending login details
        headers: {
          "Content-Type": "application/json", //request body contains JSON data
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await response.json(); //waits for server response

      if (response.ok) {
        router.replace("/"); //upon successful login, redirects
      } else {
        setError(data?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      //for unexpected errors
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-custom-blue-600 to-custom-blue-950 p-4">
      <form
        onSubmit={handleLogin}
        className="space-y-4 p-8 rounded-lg shadow-lg w-full max-w-md bg-black"
      >
        <h2 className="text-2xl font-bold text-center">Login Form</h2>

        <div className="flex justify-between bg-gray-100 rounded-full overflow-hidden">
          <button
            type="button"
            className="w-1/2 bg-gradient-to-r from-custom-blue-50 to-custom-blue-300 text-white py-2"
          >
            Login
          </button>
          <button
            className="w-1/2 text-gray-700 py-2 cursor-pointer"
            onClick={() => router.push("/auth/signup")}
          >
            Signup
          </button>
        </div>

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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <p className="text-right text-sm text-custom-blue-50 cursor-pointer">
          Forgot password?
        </p>

        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-custom-blue-50 to-custom-blue-300 text-white rounded-lg cursor-pointer"
        >
          Login
        </button>

        <p className="text-sm text-center">
          Not a member?{" "}
          <span
            onClick={() => router.push("/auth/signup")}
            className="text-custom-blue-50 font-bold cursor-pointer"
          >
            Signup now
          </span>
        </p>
      </form>
    </div>
  );
}
