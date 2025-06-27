"use client";
import CustomToast from "@/components/CustomToast";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  ExternalLink,
  GitBranch,
  Folder,
  Calendar,
  Github,
  Play,
  Terminal,
  Clock,
  Code,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import dotenv from "dotenv";
import EnhancedLogDisplay from "@/components/EnhancedLogDisplay";

dotenv.config();

const ProjectDetails = () => {
  const projectName = usePathname().split("/")[2];
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);

  useEffect(() => {
    const getProject = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/getProject?projectName=${projectName}`,
          { credentials: "include" }
        );
        const data = await response.json();
        console.log(data);
        setProject(data);
      } catch (error) {
        console.error(error);
        CustomToast("Error fetching project");
        setTimeout(() => {
          router.replace("/project");
        }, 2000);
      }
    };
    getProject();
  }, [projectName]);

  const updateDeployment = async (deploymentId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/update`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "PUT",
          body: JSON.stringify({ _id: deploymentId }),
        }
      );
    } catch (error) {}
  };

  const runDockerContainer = async (repoName, imageName, deploymentId) => {
    try {
      setLogs((prev) => [...prev, "Starting docker container run"]);
      const controller = new AbortController();

      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/dockerContainer`,
        {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoName,
            imageName,
          }),
        }
      )
        .then((response) => {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          const readChunk = () => {
            reader.read().then(({ done, value }) => {
              if (done) return;
              const text = decoder.decode(value);
              setLogs((prev) => [...prev, text]);

              const match = text.match(/\[RUN_COMPLETE\] (.*)/);
              if (match) {
                let url = match[1];
                console.log("Run complete. url:", url);
                setLogs((prev) => [...prev, "Run complete"]);
                setIsBuilding(false);
                updateDeployment(deploymentId);
              }

              readChunk();
            });
          };

          readChunk();
        })
        .catch((err) => console.error("Streaming error:", err));

      () => controller.abort();
    } catch (error) {
      console.log(error);
      CustomToast("Error while running docker container");
      setLogs((prev) => [...prev, "Error while running docker container"]);
    }
  };

  const getVersion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/version`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName,
          }),
        }
      );

      const data = await response.json();
      return data.version;
    } catch (error) {}
  };

  const createDeployment = async (imageName) => {
    try {
      console.log("Working");
      const prevVersion = await getVersion();
      const version = (Number(prevVersion) + 1).toString();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/create`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName,
            imageName,
            version,
            status: "in-progress",
            logUrl:
              `${process.env.FRONTEND_URL}` +
              "/logs" +
              projectName +
              "/" +
              version,
            previewUrl:
              `${process.env.FRONTEND_URL}` + "/" + projectName + "/" + version,
          }),
          method: "POST",
          credentials: "include",
        }
      );
      console.log("Worked");
      const data = await response.json();
      return data._id;
    } catch (error) {
      console.error(error);
      CustomToast("Error making a new deployment");
    }
  };

  const generateDockerImage = async (repoName, clonedPath) => {
    try {
      setLogs((prev) => [...prev, "Starting docker image build"]);
      const controller = new AbortController();

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/dockerImage`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: repoName,
          clonedPath,
        }),
      })
        .then((response) => {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          const readChunk = () => {
            reader.read().then(async ({ done, value }) => {
              if (done) return;
              const text = decoder.decode(value);
              setLogs((prev) => [...prev, text]);

              const match = text.match(/\[BUILD_COMPLETE\] (.*)/);
              if (match) {
                let fullImageName = match[1];
                console.log("Build complete. Image name:", fullImageName);
                setLogs((prev) => [...prev, "Build complete"]);
                let deploymentId = await createDeployment(fullImageName);
                runDockerContainer(repoName, fullImageName, deploymentId);
              }

              readChunk();
            });
          };

          readChunk();
        })
        .catch((err) => console.error("Streaming error:", err));

      () => controller.abort();
    } catch (error) {
      console.log(error);
      CustomToast("Error while building dockerimage");
      setLogs((prev) => [...prev, "Error while building docker image"]);
    }
  };

  const generateDockerfile = async (repoName, clonedPath, techStack) => {
    try {
      setLogs((prev) => [...prev, "Generating dockerfile"]);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/dockerFile`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            clonedPath,
            techStack,
          }),
        }
      );
      const data = await response.json();
      setLogs((prev) => [...prev, "Dockerfile generated"]);
      generateDockerImage(repoName, clonedPath);
    } catch (error) {
      console.log(error);
      CustomToast("Error while generating dockerfile");
      setLogs((prev) => [...prev, "Error while generating dockerfile"]);
    }
  };

  const handleBuildAndPreview = async () => {
    if (!project || !generateDockerfile) return;

    setIsBuilding(true);
    try {
      await generateDockerfile(
        project.repoName || "",
        project.clonedPath || "",
        project.framework || ""
      );
    } catch {}
  };

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
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
              Project Details
            </h1>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
        </div>

        {!project ? (
          <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-12 text-center border border-purple-500/20 backdrop-blur-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-6 shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Loading Project
            </h2>
            <p className="text-gray-400">Fetching project details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg">
                        <Github className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">
                          {project.project_name || project.name}
                        </h2>
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
                  <div className="bg-[#2c2f4a]/50 rounded-2xl p-5 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Github className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="font-semibold text-blue-300 text-sm uppercase tracking-wide">
                        Repository
                      </span>
                    </div>
                    {project.repositoryUrl ? (
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors duration-200 group"
                      >
                        <span className="truncate">
                          {project.repositoryUrl}
                        </span>
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </a>
                    ) : (
                      <span className="text-gray-400">
                        {project.repositoryName || "N/A"}
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
                      {project.branch || "N/A"}
                    </span>
                  </div>

                  {project.folder && (
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
                        {project.folder}
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
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Build & Deploy
                  </h3>
                </div>

                <button
                  onClick={handleBuildAndPreview}
                  disabled={isBuilding || !generateDockerfile}
                  className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all duration-500 flex items-center justify-center gap-3 ${
                    !isBuilding && generateDockerfile
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
                    <div className="text-2xl font-bold text-blue-400">
                      {logs.length}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Log Entries
                    </div>
                  </div>
                  <div className="bg-[#2c2f4a]/50 rounded-xl p-4 text-center border border-gray-600/20">
                    <div className="text-2xl font-bold text-green-400">
                      {project.status === "success" ? "✓" : "—"}
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">
                      Status
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-3">
              <EnhancedLogDisplay logs={logs} isBuilding={isBuilding} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
