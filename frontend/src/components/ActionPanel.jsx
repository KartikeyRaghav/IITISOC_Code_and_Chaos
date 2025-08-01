import React from "react";
import {
  Github,
  Download,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  Zap,
} from "lucide-react";

const ActionPanel = ({
  onGetRepos,
  onGetUserRepos,
  onGetGithubRepos,
  hasGithubPermission,
  githubInstallationId,
  handleInstall,
}) => {
  console.log(hasGithubPermission, githubInstallationId);

  const ButtonWrapper = ({
    children,
    onClick,
    disabled = false,
    variant = "primary",
  }) => {
    const baseClasses =
      "group relative w-full max-w-sm mx-auto overflow-hidden rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1";
    const variants = {
      primary: disabled
        ? "bg-gradient-to-r from-gray-600 to-gray-700 cursor-not-allowed"
        : "bg-gradient-to-r from-[#005b83] via-[#0077ab] to-[#9a00ff] hover:from-[#004a6b] hover:via-[#0066a1] hover:to-[#8800ee]",
      success:
        "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${variants[variant]}`}
      >
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        {/* Button Content */}
        <div className="relative px-8 py-4 flex items-center justify-center gap-3 text-white font-bold text-lg">
          {children}
        </div>

        {/* Bottom Glow Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      </button>
    );
  };

  return (
    <section className="relative w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-6 sm:p-8 space-y-8 min-h-[300px] lg:min-h-screen overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #0077ab 0%, transparent 50%), 
                           radial-gradient(circle at 75% 75%, #9a00ff 0%, transparent 50%)`,
            backgroundSize: "100px 100px",
          }}
        ></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#0077ab] to-[#9a00ff] rounded-2xl flex items-center justify-center shadow-lg">
            <Github className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            GitHub Integration
          </h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Connect your GitHub account to start deploying your repositories with
          ease
        </p>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* GitHub OAuth Connection */}
        <div className="relative inline-block w-full max-w-sm mx-auto">
          <ButtonWrapper
            onClick={onGetRepos}
            disabled={hasGithubPermission}
            variant={hasGithubPermission ? "success" : "primary"}
          >
            {hasGithubPermission ? (
              <>
                <CheckCircle className="w-6 h-6" />
                GitHub OAuth Connected
              </>
            ) : (
              <>
                <Github className="w-6 h-6" />
                Connect GitHub OAuth
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </>
            )}
          </ButtonWrapper>

          {hasGithubPermission && (
            <div className="absolute -top-2 -right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* GitHub App Installation */}
        {hasGithubPermission && githubInstallationId === "null" && (
          <div className="animate-fade-in">
            <ButtonWrapper onClick={handleInstall}>
              <Zap className="w-6 h-6" />
              Install GitHub App
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </ButtonWrapper>
          </div>
        )}

        {/* Repository Actions */}
        {hasGithubPermission && (
          <div className="space-y-4 animate-fade-in">
            <ButtonWrapper onClick={onGetUserRepos}>
              <Download className="w-6 h-6" />
              Get Cached Repos
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </ButtonWrapper>

            <ButtonWrapper onClick={onGetGithubRepos}>
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              Fetch Repos from GitHub
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </ButtonWrapper>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {hasGithubPermission && (
        <div className="relative z-10 flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl backdrop-blur-sm">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-300 font-medium">
            GitHub integration active
          </span>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
    </section>
  );
};

export default ActionPanel;
