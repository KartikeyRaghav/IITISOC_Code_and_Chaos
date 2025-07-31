import React from "react";
import { Play, Loader2, BarChart3, ExternalLink } from "lucide-react";

const BuildDeployCard = ({
  isBuilding,
  onBuildAndPreview,
  logsCount,
  deploymentsCount,
  isAutoDeployEnabled,
  onAutoDeployToggle,
  onViewAnalytics,
  showAutoDeploy,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Build & Deploy</h3>
        </div>

        {/* Analytics Button */}

        <button
          onClick={onViewAnalytics}
          className="flex items-center gap-2 px-3 py-2 bg-[#2c2f4a]/70 hover:bg-[#2c2f4a] rounded-xl border border-gray-600/30 hover:border-blue-400/50 text-gray-300 hover:text-blue-400 transition-all duration-300 group"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-sm font-medium">Analytics</span>
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Auto-deployment Toggle */}
      {showAutoDeploy && (
        <div className="mb-6 p-4 bg-[#2c2f4a]/30 rounded-2xl border border-gray-600/20">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white font-medium">Auto-deployment</span>
              <span className="text-xs text-gray-400">
                Automatically deploy on code changes
              </span>
            </div>

            {/* Custom Toggle Switch */}
            <button
              onClick={() => onAutoDeployToggle(!isAutoDeployEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#23243a] ${
                isAutoDeployEnabled
                  ? "bg-gradient-to-r from-[#00aaff] to-[#9a00ff]"
                  : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isAutoDeployEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {isAutoDeployEnabled && (
            <div className="mt-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">
                Auto-deployment active
              </span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onBuildAndPreview}
        disabled={isBuilding}
        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-500 flex items-center justify-center gap-3 ${
          !isBuilding
            ? "bg-gradient-to-r from-[#00aaff] via-[#0099ff] to-[#9a00ff] text-white hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] transform"
            : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isBuilding ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Building...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Build and Preview
          </>
        )}
      </button>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-[#2c2f4a]/50 rounded-xl p-4 text-center border border-gray-600/20 hover:border-blue-400/30 transition-colors duration-300">
          <div className="text-2xl font-bold text-blue-400">{logsCount}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Log Entries
          </div>
        </div>
        <div className="bg-[#2c2f4a]/50 rounded-xl p-4 text-center border border-gray-600/20 hover:border-green-400/30 transition-colors duration-300">
          <div className="text-2xl font-bold text-green-400">
            {deploymentsCount}
          </div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Deployments
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildDeployCard;
