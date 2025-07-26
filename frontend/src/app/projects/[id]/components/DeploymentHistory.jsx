import React from "react";
import { History } from "lucide-react";
import DeploymentCard from "./DeploymentCard";

const DeploymentHistory = ({
  deployments,
  projectName,
  copiedUrl,
  onCopyToClipboard,
  onDeploy,
  project,
}) => {
  if (!deployments || deployments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br max-h-screen overflow-y-auto from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl border border-purple-500/20 backdrop-blur-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#2c2f4a] to-[#1e1f3a] px-8 py-6 border-b border-gray-600/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">Deployment History</h4>
            <p className="text-gray-400 text-sm">
              Track all deployments for this project
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {deployments.map((deployment) => (
            <DeploymentCard
              key={deployment._id}
              deployment={deployment}
              projectName={projectName}
              copiedUrl={copiedUrl}
              onCopyToClipboard={onCopyToClipboard}
              onDeploy={onDeploy}
              project={project}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeploymentHistory;
