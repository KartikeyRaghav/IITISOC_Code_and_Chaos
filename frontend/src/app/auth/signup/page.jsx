"use client";
import CustomLoader from "@/components/CustomLoader";
import { checkAuth } from "@/utils/checkAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import dotenv from "dotenv";
import AuthForms from "../AuthForm";

dotenv.config(); //load env variables

//signup comp
//handles user signup process
//checks if user already authenticated and redirects if yes
//sends OTP to provide email via backend
//stored signup data temporarily and navigates to OTP verification page
export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState(""); //for error msgs
  const [isAuthenticated, setIsAuthenticated] = useState(null); //null= pending, true/false after check
  const [isLoading, setIsLoading] = useState(false); //loading state while sending OTP

  //effect runs once on mount
  //checks if user already authenticated
  //if authenticated, redirects to dashboard
  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth(); //calls auth check utility
      if (data.status === 200) {
        //user is authenticated
        router.replace("/dashboard"); //if authenticated, redirects to dashboard
      }
    };
    verifyAuth();
    setIsAuthenticated(true); //mark auth check as finished
  }, []);

  //form submission handler for signup
  const handleSignup = async (formData) => { 
    setError(""); //clear existing msgs

    //check if psw and confirm psw matches
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    } //checks if psw matches, if not sets error and stops

    const lowerCaseEmail = formData.email.toLowerCase(); //normalise email to lowercase to avoid case sensitivity issues
    const [address, domain] = lowerCaseEmail.split("@"); //extract address and domain from email for domain verification

    //allow signup only if email domain is iiti.ac.in
    if (domain != "iiti.ac.in") { 
      setError("Please sign up with your institute email id");
      return;//stop submission if doamin invalid
    }

    setIsLoading(true); //show loading indicator before sending API request
    try {
      // Send POST request to backend API endpoint to trigger sending OTP to user email
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/sendOtp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
          }),
          credentials: "include", //include cookies/auth if needed
        }
      );
      const data = await response.json();

      if (response.ok) {
        //if OTP send succeeded, store relevant signup info in localStorage temporarily
        localStorage.setItem(
          "formData",
          JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
          })
        );

        //navigate to OTP verification page so user can enter OTP
        router.push("/auth/otpVerification");
      } else {
        //if backend returned error, extract msg for display
        const errorMessage =
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : "Unknown error");
        setError(errorMessage);
      }
    } catch (err) {
      //catch network or other unexpected errors
      console.error("Full error object:", err);
      setError(err.message || "Network request failed.");
    }
    setIsLoading(false); // Hide loading indicator after request completes
  };
  
  // While authentication status is unresolved, show loader
  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <AuthForms
      type="signup"
      onSubmit={handleSignup}
      onToggleForm={() => router.push("/auth/login")}
      error={error}
      isLoading={isLoading}
    />
  );
}
