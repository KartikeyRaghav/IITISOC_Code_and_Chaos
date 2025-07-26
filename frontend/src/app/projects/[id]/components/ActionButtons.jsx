import React from "react";
import {
  Globe,
  Code,
  Copy,
  Check,
  Rocket,
  History,
  ExternalLink,
} from "lucide-react";

const ActionButtons = ({
  deployment,
  projectName,
  copiedUrl,
  onCopyToClipboard,
  onDeploy,
  project,
}) => {
  return (
    <div className="flex items-center gap-3 flex-wrap pt-4 border-t border-gray-600/20">
      {/* Preview Status Actions */}
      {deployment.status === "in-preview" && (
        <div className="flex items-center gap-2">
          <a
            onClick={() => onDeploy(deployment, false)}
            href={`http://${projectName}-preview.deploy.princecodes.online`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 font-medium transition-colors"
          >
            <Globe className="w-4 h-4" />
            View Preview
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() =>
              onCopyToClipboard(
                `http://${projectName}-preview.deploy.princecodes.online`,
                "preview"
              )
            }
            className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-colors"
            title="Copy preview URL"
          >
            {copiedUrl ===
            `preview-http://${projectName}-preview.deploy.princecodes.online` ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-green-400" />
            )}
          </button>
        </div>
      )}

      {deployment.status === "in-preview" && (
        <button
          onClick={() => onDeploy(deployment, true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium transition-colors"
        >
          <Rocket className="w-4 h-4" />
          Deploy to Production
        </button>
      )}

      {deployment.status === "deployed" && (
        <div className="flex items-center gap-2">
          <a
            href={`http://${projectName}.deploy.princecodes.online`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 font-medium transition-colors"
          >
            <Globe className="w-4 h-4" />
            View Live
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() =>
              onCopyToClipboard(
                `http://${projectName}.deploy.princecodes.online`,
                "deploy"
              )
            }
            className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
            title="Copy live URL"
          >
            {copiedUrl ===
            `deploy-http://${projectName}.deploy.princecodes.online` ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <a
          href={`/logs/${projectName}/${deployment._id}`}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-medium transition-colors"
        >
          <Code className="w-4 h-4" />
          View Logs
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={() =>
            onCopyToClipboard(`/logs/${projectName}/${deployment._id}`, "logs")
          }
          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
          title="Copy logs URL"
        >
          {copiedUrl === `logs-/logs/${projectName}/${deployment._id}` ? (
            <Check className="w-4 h-4 text-blue-400" />
          ) : (
            <Copy className="w-4 h-4 text-blue-400" />
          )}
        </button>
      </div>

      {deployment.rollbackAvailable &&
        project.deployments?.some((d) => d.status === "deployed") && (
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 font-medium transition-colors ml-auto">
            <History className="w-4 h-4" />
            Rollback Available
          </button>
        )}
    </div>
  );
};

export default ActionButtons;
