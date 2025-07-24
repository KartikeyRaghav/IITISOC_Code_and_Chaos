import React from "react";
import { Play, Loader2 } from "lucide-react";

const BuildDeployCard = ({
  isBuilding,
  onBuildAndPreview,
  logsCount,
  deploymentsCount,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg">
          <Play className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Build & Deploy</h3>
      </div>

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
        <div className="bg-[#2c2f4a]/50 rounded-xl p-4 text-center border border-gray-600/20">
          <div className="text-2xl font-bold text-blue-400">{logsCount}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            Log Entries
          </div>
        </div>
        <div className="bg-[#2c2f4a]/50 rounded-xl p-4 text-center border border-gray-600/20">
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
