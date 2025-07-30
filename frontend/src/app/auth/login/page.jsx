"use client";
import CustomLoader from "@/components/CustomLoader";
import { checkAuth } from "@/utils/checkAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import dotenv from "dotenv";
import AuthForms from "../AuthForm";
import { AlertCircle, Mail, RefreshCcw } from "lucide-react";

dotenv.config(); //loads env variables

//ForgotPasswordModal comp
//handles form submission, shows loading and error/success msgs
const ForgotPasswordModal = ({ setShowForgotPasswordModal }) => {
  const [email, setEmail] = useState(""); //user's input
  const [error, setError] = useState(null);

//handles "forgot submission"
  const handleForgotPassword = async (e) => {
    setError(""); //clear previous error msgs
    e.preventDefault(); 
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/requestPasswordReset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email, //send user's email in payload
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setError("Reset password email sent. Please check your mail");
      } else {
        setError( //show error msg from API response (if given)
          data?.message || "Reset password email send failed. Please try again."
        );
      }
    } catch (err) { //unexpected errors
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-25 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] p-6 rounded-3xl shadow-lg max-w-sm w-full border-2 border-blue-900">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-4 shadow-lg">
            <RefreshCcw className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
            Reset Password
          </h2>
          <p className="text-gray-400">Reset your current password</p>
        </div>
        <form action="" onSubmit={handleForgotPassword}>
          <div className="space-y-2">
            <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-green-400" />
              Email Address
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="w-full p-4 pl-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 backdrop-blur-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-4 justify-end">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className={`w-full py-4 rounded-xl font-bold text-lg border-1 transition-all duration-500 flex items-center justify-center gap-3 text-white`}
            >
              Cancel
            </button>
            <button
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all duration-500 flex items-center justify-center gap-3 bg-gradient-to-r from-[#00aaff] via-[#0099ff] to-[#9a00ff] text-white hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] transform`}
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/login`,
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
    <>
      <AuthForms
        onSubmit={handleLogin}
        onToggleForm={() => router.push("/auth/signup")}
        error={error}
        type="login"
        isLoading={isLoading}
        setShowForgotPasswordModal={setShowForgotPasswordModal}
      />

      {showForgotPasswordModal && (
        <ForgotPasswordModal
          setShowForgotPasswordModal={setShowForgotPasswordModal}
        />
      )}
    </>
  );
}
