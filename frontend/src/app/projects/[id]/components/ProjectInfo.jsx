import React from "react";
import {
  Github,
  GitBranch,
  Folder,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Code,
  Loader2,
} from "lucide-react";

const ProjectInfo = ({ project, isBuilding }) => {
  const getStatusIcon = () => {
    if (isBuilding)
      return <Loader2 className="w-5 h-5 animate-spin text-blue-400" />;
    if (project?.status === "success")
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    if (project?.status === "error")
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    return <Code className="w-5 h-5 text-purple-400" />;
  };

  const getStatusText = () => {
    if (isBuilding) return "Building...";
    if (project?.status === "success") return "Build Successful";
    if (project?.status === "error") return "Build Failed";
    return "Ready to Build";
  };

  return (
    <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{project.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon()}
                <span className="text-sm font-medium text-gray-300">
                  {getStatusText()}
                </span>
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            {project.description || "No description available"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repository */}
        <div className="bg-[#2c2f4a]/50 rounded-2xl p-5 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Github className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-semibold text-blue-300 text-sm uppercase tracking-wide">
              Repository
            </span>
          </div>
          {project.github.repositoryUrl ? (
            <a
              href={project.github.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors duration-200 group"
            >
              <span className="truncate">{project.github.repositoryUrl}</span>
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </a>
          ) : (
            <span className="text-gray-400">
              {project.github.repoName || "N/A"}
            </span>
          )}
        </div>

        <div className="bg-[#2c2f4a]/50 rounded-2xl p-5 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-green-400" />
            </div>
            <span className="font-semibold text-green-300 text-sm uppercase tracking-wide">
              Branch
            </span>
          </div>
          <span className="text-white font-mono bg-gray-800/50 px-3 py-1 rounded-lg text-sm">
            {project.github.branch || "N/A"}
          </span>
        </div>

        {project.github.folder && (
          <div className="bg-[#2c2f4a]/50 rounded-2xl p-5 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Folder className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="font-semibold text-yellow-300 text-sm uppercase tracking-wide">
                Folder
              </span>
            </div>
            <span className="text-white font-mono bg-gray-800/50 px-3 py-1 rounded-lg text-sm">
              {project.github.folder}
            </span>
          </div>
        )}

        <div className="bg-[#2c2f4a]/50 rounded-2xl p-5 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
            <span className="font-semibold text-purple-300 text-sm uppercase tracking-wide">
              Created
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-white text-sm">
              {project.createdAt
                ? new Date(project.createdAt).toLocaleString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;
