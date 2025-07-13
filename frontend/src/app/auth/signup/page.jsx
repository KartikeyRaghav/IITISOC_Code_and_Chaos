"use client";
import CustomLoader from "@/components/CustomLoader";
import ProfileUpload from "@/components/ProfileUpload";
import { checkAuth } from "@/utils/checkAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import dotenv from "dotenv";
import AuthForms from "../AuthForm";

dotenv.config();

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      if (data.status === 200) {
        router.replace("/dashboard"); //if authenticated, redirects
      }
    };
    verifyAuth();
    setIsAuthenticated(true);
  }, []);

  const handleSignup = async (formData) => {
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    } //checks if psw matches, if not sets error and stops

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/register`,
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
        router.replace("/dashboard");
      } else {
        const errorMessage =
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : "Unknown error");
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Full error object:", err);
      setError(err.message || "Network request failed.");
    }
    setIsLoading(false);
  };

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
