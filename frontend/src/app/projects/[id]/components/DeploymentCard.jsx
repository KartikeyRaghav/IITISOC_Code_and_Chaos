import React from "react";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import StatusBadge from "./StatusBadge";
import ActionButtons from "./ActionButtons";

const DeploymentCard = ({
  deployment,
  projectName,
  copiedUrl,
  onCopyToClipboard,
  onDeployToProduction,
  project,
}) => {
  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);

    if (duration < 60) return `${duration}s`;
    if (duration < 3600)
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    if (duration < 3600 * 24)
      return `${Math.floor(duration / 3600)}h ${Math.floor(
        (duration % 3600) / 60
      )}m`;
    return `${Math.floor(duration / 86400)} day${
      Math.floor(duration / 86400) > 1 ? "s" : ""
    } ${Math.floor((duration % 86400) / 3600)}h`;
  };

  return (
    <div className="bg-[#2c2f4a]/50 rounded-2xl p-6 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.01]">
      <div className="flex items-start flex-wrap justify-between mb-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={deployment.status} />
          <span className="text-gray-400 text-sm">
            Version {deployment.version}
          </span>
        </div>
        <div className="ml-auto p-2 text-right">
          <div className="text-sm text-white font-medium">
            {deployment.startTime
              ? formatDuration(deployment.startTime, deployment.endTime)
              : "Preview"}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(deployment.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">Started:</span>
            <span className="text-white">
              {deployment.startTime
                ? new Date(deployment.startTime).toLocaleString()
                : "-"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {deployment.status === "failed" ? (
              <AlertCircle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
            <span className="text-gray-400">
              {deployment.status === "failed" ? "Ended:" : "Completed:"}
            </span>
            <span className="text-white">
              {deployment.endTime
                ? new Date(deployment.endTime).toLocaleString()
                : "-"}
            </span>
          </div>
        </div>
      </div>

      <ActionButtons
        deployment={deployment}
        projectName={projectName}
        copiedUrl={copiedUrl}
        onCopyToClipboard={onCopyToClipboard}
        onDeployToProduction={onDeployToProduction}
        project={project}
      />
    </div>
  );
};

export default DeploymentCard;
