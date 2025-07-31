import React, { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
} from "lucide-react";

//AuthForms component: handles both login and signup forms, supports toggling, input handling, errors, loading states, and image uploads
const AuthForms = ({
  type, //"login" or "signup"
  onSubmit, 
  onToggleForm, //callback to toggle between login/signup forms
  error,
  isLoading = false,
  setShowForgotPasswordModal, //function to activate forgot psw modal (login only)
}) => {
  //manages forms input state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  //toggles for visibility of psws 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  //handles text field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  //invokes onSubmit prop with current formData on submit
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isSignup = type === "signup"; //derived: is the form for signup?

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3] flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative bg-gradient-to-br from-[#23243a] to-[#1a1b2e] p-8 rounded-3xl shadow-2xl w-full max-w-md border border-purple-500/20 backdrop-blur-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-4 shadow-lg">
            {isSignup ? (
              <UserPlus className="w-8 h-8 text-white" />
            ) : (
              <LogIn className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400">
            {isSignup
              ? "Join us and start deploying"
              : "Sign in to your account"}
          </p>
        </div>

        {/* Form Toggle */}
        <div className="mb-8">
          <div className="bg-[#2c2f4a]/50 rounded-2xl p-2 border border-gray-600/30">
            <div className="flex">
              {/*login button; active if not on signup*/}
              <button
                type="button"
                onClick={onToggleForm}
                className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  !isSignup
                    ? "bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              {/*signup button; active if on signup*/}
              <button
                type="button"
                onClick={onToggleForm}
                className={`flex items-center justify-center gap-2 flex-1 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isSignup
                    ? "bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Signup
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name - Signup Only */}
          {isSignup && (
            <div className="space-y-2">
              <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Full Name
              </label>
              <div className="relative">
                <input
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-4 pl-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 backdrop-blur-sm"
                  value={formData.fullName || ""}
                  onChange={handleChange}
                  required={isSignup}
                />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Email */}
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
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" />
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full p-4 pl-12 pr-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 backdrop-blur-sm"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password - Signup Only */}
          {isSignup && (
            <div className="space-y-2">
              <label className="text-gray-300 font-medium text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-yellow-400" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="w-full p-4 pl-12 pr-12 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 backdrop-blur-sm"
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  required={isSignup}
                />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Forgot Password - Login Only */}
          {!isSignup && (
            <div className="text-right">
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                onClick={() => setShowForgotPasswordModal(true)}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all duration-500 flex items-center justify-center gap-3 ${
              !isLoading
                ? "bg-gradient-to-r from-[#00aaff] via-[#0099ff] to-[#9a00ff] text-white hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] transform"
                : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isSignup ? "Creating Account..." : "Signing In..."}
              </>
            ) : (
              <>
                {isSignup ? (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    Sign In
                  </>
                )}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={onToggleForm}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              {isSignup ? "Sign in here" : "Create one now"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForms;
