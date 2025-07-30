"use client";
import { useState, useEffect } from "react";
import { Sparkles, KeyRound, AlertCircle } from "lucide-react"; //icons for UI
import { useRouter } from "next/navigation";
import dotenv from "dotenv";

dotenv.config(); //load env variables

//OTP verification component
//handles user OTP input for email verification after signup
//includes resend OTP functionality
export default function OtpVerificationPage() {
  //timer for resend OTP functionality
  const [timeLeft, setTimeLeft] = useState(60);
  //form data previously stored
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
  });
  const [otp, setOtp] = useState(""); //OTP input value state
  const router = useRouter(); //to navigate programmatically
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(""); //to display error msg

  //effect to update the countdown timer every sec
  //decrements until it reaches 0
  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t); //cleanup timeout if component unmounts or updates
    }
  }, [timeLeft]);

  //effect that loads stored 'formData'
  //necessary to get email,fullName, password saved earlier
  useEffect(() => {
    setFormData(JSON.parse(localStorage.getItem("formData")));
  });

  //handler to resend OTP when timer reaches zero
  //sends POST request to backend to resend OTP email
  const handleResend = async () => {
    if (timeLeft === 0) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/sendOtp`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email, //use stored email
            }),
            credentials: "include",
          }
        );

        if (response.ok) {
          setTimeLeft(60); //reset countdown timer on successful resend
        } else {
          setError("Failed to resend otp"); //show error msg if resend fails
        }
      } catch (err) {
        console.error("Full error object:", err); //log the unexpected errors
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/verifyOtp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            otp,
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        const signupResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/register`,
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

        const signupData = await signupResponse.json();

        if (signupResponse.ok) {
          localStorage.removeItem("formData");
          router.replace("/auth/login");
        } else {
          const errorMessage =
            signupData?.message ||
            signupData?.error ||
            (typeof signupData === "string" ? signupData : "Unknown error");
          setError(errorMessage);
        }
      } else {
        const errorMessage =
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : "Unknown error");
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Full error object:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#004466] via-[#1a365d] to-[#6a00b3] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-gradient-to-r from-[#23243a] to-[#1a1b2e] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-purple-500/20 backdrop-blur-sm z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-4 shadow-lg">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
            OTP Verification
          </h2>
          <p className="text-gray-400">Enter the OTP sent to your mail</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              OTP Code
            </label>
            <div className="relative">
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onInput={(e) => {
                  const maxLength = 6;
                  if (e.target.value.length > maxLength) {
                    e.target.value = e.target.value.slice(0, maxLength);
                  }
                }}
                type="number"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                className="no-spinner w-full p-4 pl-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 backdrop-blur-sm text-center text-lg tracking-widest"
              />
              <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <button
            type="button"
            className="w-full py-4 rounded-xl font-bold text-lh shadow-xl bg-gradient-to-r from-[#00aaff] via-[#0099ff] to-[#9a00ff] text-white mt-2 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={otp.length !== 6}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <KeyRound className="w-6 h-6" />
                Verify OTP
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          {timeLeft > 0 ? (
            <span className="text-gray-400 text-sm">
              Didn't get the code?{" "}
              <span className="text-blue-400 font-semibold opacity-60 cursor-not-allowed select-none">
                Resend in {timeLeft}s
              </span>
            </span>
          ) : (
            <button
              type="button"
              className="text-blue-400 font-semibold text-sm hover:text-blue-300 transition-colors"
              onClick={handleResend}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
