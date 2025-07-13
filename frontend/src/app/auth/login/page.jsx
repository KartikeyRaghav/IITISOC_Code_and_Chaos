"use client";
import CustomLoader from "@/components/CustomLoader";
import { checkAuth } from "@/utils/checkAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import dotenv from "dotenv";
import AuthForms from "../AuthForm";

dotenv.config();

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      if (data.status === 200) {
        router.replace("/dashboard");
      }
    };
    verifyAuth();
    setIsAuthenticated(true);
  }, []);

  const handleLogin = async (formData) => {
    setError("");

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.replace("/dashboard");
      } else {
        setError(data?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <AuthForms
      onSubmit={handleLogin}
      onToggleForm={() => router.push("/auth/signup")}
      error={error}
      type="login"
      isLoading={isLoading}
    />
  );
}
