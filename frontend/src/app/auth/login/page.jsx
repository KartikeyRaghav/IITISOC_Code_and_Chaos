"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); //stored the error message to be shown

  const handleLogin = async (e) => {
    //function triggered when login form is submitted
    e.preventDefault(); //prevents page reload upon submitting the form
    setError(""); //clears previous error message

    try {
      const response = await fetch("http://localhost:3000/api/v1/users/login", {
        method: "POST", //POST request to backend API, tells server that we are sending login details
        credentials: "include", //cookies/sessions with request, for storing login tokens
        headers: {
          "Content-Type": "application/json", //request body contains JSON data
        },
        body: JSON.stringify({
          //sends login data as JSON string
          usernameOrEmail,
          password,
        }),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#001b29] to-[#000E14] p-4">
      <form
        onSubmit={handleLogin}
        className="space-y-4 p-8 rounded-lg shadow-lg w-full max-w-md bg-black"
      >
        <h2 className="text-2xl font-bold text-center">Login Form</h2>

        <div className="flex justify-between bg-gray-100 rounded-full overflow-hidden">
          <button
            type="button"
            className="w-1/2 bg-gradient-to-r from-[#00628d] to-[#003047] text-white py-2"
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
          type="text"
          placeholder="Username or Email"
          value={usernameOrEmail}
          className="w-full px-4 py-2 border rounded-xl"
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-xl"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <p className="text-right text-sm text-[#003D5C] cursor-pointer">
          Forgot password?
        </p>

        <button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-[#00628d] to-[#003047] text-white rounded-lg cursor-pointer"
        >
          Login
        </button>

        <p className="text-sm text-center">
          Not a member?{" "}
          <span
            onClick={() => router.push("/auth/signup")}
            className="text-[#003D5C] cursor-pointer"
          >
            Signup now
          </span>
        </p>
      </form>
    </div>
  );
}
