"use client";
import CustomToast from "@/components/CustomToast";
import { Lock, EyeOff, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import dotenv from "dotenv";

dotenv.config(); //load env variables

//ResetPasswordPage component
//provides form for users to reset their psw using a token from URL
//validates psw and confirm psw inputs
//sends request to reset the psw on submit and handles loading and error states
const ResetPasswordPage = () => {
  const searchParams = useSearchParams(); //access URL search params (to get token)
  //state variables for psw fields and visibility toggles
  const [password, setPassword] = useState(""); 
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);//for error msg
  const [isLoading, setIsLoading] = useState(false); //for loading status
  const router = useRouter();

  //handles form submission to reset psw
  //validates inputCSS, sends API request with token and new psw
  // shows toast on success and redirects to login page
  const handlePasswordReset = async (e) => {
    e.preventDefault(); //prevent default form submission

    //extract token from URL search params
    const token = searchParams.get("token");

    setError(""); //clear prev errors
    
    //basic validation: check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true); //set loading state while request is pending
    try {
      //send POST request to backend API for psw reset
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/resetPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token, //psw reset token from URL
            newPassword: password, //new psw entered by user
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        //show success toast notification
        CustomToast("Password reset successful. Redirecting...");
        //wait 1.5s to allow user to see toast, then redirect to login page
        setTimeout(() => {
          router.replace("/auth/login");
        }, 1500);
      } else {
        //show error msg from backend or fallback
        const errorMessage =
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : "Unknown error");
        setError(errorMessage);
      }
    } catch (err) {
      //log unexpected errors
      console.error("Full error object:", err);
    } finally {
      setIsLoading(false); //reset loading state
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-gradient-to-br from-[#23243a] to-[#1a1b2e] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-purple-500/20 backdrop-blur-sm z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
            Reset Password
          </h2>
          <p className="text-gray-400">Enter your new password below</p>
        </div>

        <form className="space-y-6" onSubmit={handlePasswordReset}>
          <div className="space-y-2">
            <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                className="w-full p-4 pl-12 pr-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 background-blur-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                className="w-full p-4 pl-12 pr-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 background-blur-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl font-bold text-lg shadow-xl bg-gradient-to-r from-[#00aaff] via-[#0099ff] to-[#9a00ff] text-white mt-2 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reseting...
              </>
            ) : (
              <>
                <Lock className="w-6 h-6" />
                Reset Password
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
          <p className="text-gray-400 text-sm">
            Remember your password?{" "}
            <button
              onClick={() => {
                router.push("/auth/login");
              }}
              className="text-blue-400 font-semibold cursor-pointer"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
