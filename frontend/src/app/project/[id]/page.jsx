"use client";
import CustomToast from "@/components/CustomToast";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  ExternalLink,
  GitBranch,
  Folder,
  Calendar,
  Github,
  Play,
  Clock,
  Code,
  Loader2,
  CheckCircle,
  AlertCircle,
  History,
  Globe,
  Package,
  Activity,
  Copy,
  Check,

} from "lucide-react";
import dotenv from "dotenv";
import EnhancedLogDisplay from "@/components/EnhancedLogDisplay";
import Navbar from "@/components/Navbar";
import { ToastContainer } from "react-toastify";
import { checkAuth } from "@/utils/checkAuth";
import CustomLoader from "@/components/CustomLoader";

dotenv.config();

const ProjectDetails = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const projectName = usePathname().split("/")[2];
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isError, setIsError] = useState(false);
  const [deployments, setDeployments] = useState([]);
  const [copiedUrl, setCopiedUrl] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      if (data.status === 400) {
        router.replace("/auth/login");
        return;
      }
    };
    verifyAuth();
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    const getProject = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/getProject?projectName=${projectName}`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data) setProject(data);
        else {
          CustomToast("Error fetching project");
          setTimeout(() => {
            router.replace("/project");
          }, 2000);
        }
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

  useEffect(() => {
    const getDeployments = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/all?projectName=${projectName}`,
          { credentials: "include" }
        );
        const data = await response.json();
        setDeployments(data);
      } catch (error) {
        console.error(error);
        CustomToast("Error fetching project");
      }
    };
    getDeployments();
  }, [projectName]);

  const updateDeployment = async (deploymentId, status) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/update`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "PUT",
          body: JSON.stringify({ _id: deploymentId, status }),
        }
      );
      const data = await response.json();
    } catch (error) {}
  };

  const runDockerContainer = async (
    projectName,
    imageName,
    deploymentId,
    prevPort = null
  ) => {
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
            projectName,
            imageName,
            prevPort,
            deploymentId,
          }),
        }
      )
        .then((response) => {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          const readChunk = () => {
            reader.read().then(async ({ done, value }) => {
              if (done) return;
              const text = decoder.decode(value);
              setLogs((prev) => [...prev, text]);

              const match = text.match(/\[RUN_COMPLETE\] (.*)/);
              const error = text.match(/\[ERROR\] (.*)/);
              if (error) {
                setIsBuilding(false);
                setIsError(true);
                CustomToast("Error running the docker contanier");
              }
              setLogs((prev) => [...prev, "Run complete"]);
              await updateDeployment(deploymentId, "pending");
              setIsBuilding(false);

              readChunk();
            });
          };

          readChunk();
        })
        .catch((err) => console.error("Streaming error:", err));

      () => controller.abort();
    } catch (error) {
      console.error(error);
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

  const createDeployment = async () => {
    try {
      const prevVersion = await getVersion();
      const version = (Number(prevVersion) + 1).toString();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/create`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName,
            version,
            status: "pending",
          }),
          method: "POST",
          credentials: "include",
        }
      );
      const data = await response.json();
      return data._id;
    } catch (error) {
      console.error(error);
      CustomToast("Error making a new deployment");
    }
  };

  const generateDockerImage = async (projectName, clonedPath, deploymentId) => {
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
          projectName,
          clonedPath,
          deploymentId,
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
              const error = text.match(/\[ERROR\] (.*)/);
              const prevPort = text.match(/\[PREV_PORT\] (.*)/);
              if (match) {
                let fullImageName = match[1];
                setLogs((prev) => [...prev, "Build complete"]);
                await updateDeployment(deploymentId, "pending");
                if (prevPort)
                  runDockerContainer(
                    projectName,
                    fullImageName,
                    deploymentId,
                    prevPort[1]
                  );
                else
                  runDockerContainer(projectName, fullImageName, deploymentId);
              }
              if (error) {
                setIsBuilding(false);
                await updateDeployment(deploymentId, "failed");
                setIsError(true);
                CustomToast("Error building the docker image");
              }

              readChunk();
            });
          };

          readChunk();
        })
        .catch((err) => console.error("Streaming error:", err));

      () => controller.abort();
    } catch (error) {
      console.error(error);
      CustomToast("Error while building dockerimage");
      setLogs((prev) => [...prev, "Error while building docker image"]);
    }
  };

  const generateDockerfile = async (projectName, clonedPath, techStack) => {
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
      const deploymentId = await createDeployment();
      generateDockerImage(projectName, clonedPath, deploymentId);
    } catch (error) {
      console.error(error);
      CustomToast("Error while generating dockerfile");
      setLogs((prev) => [...prev, "Error while generating dockerfile"]);
    }
  };

  const detectTechStack = async (clonedPath) => {
    try {
      setLogs((prev) => [...prev, "Detecting tech stack"]);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/detectTechStack`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            clonedPath,
          }),
        }
      );
      const data = await response.json();
      setLogs((prev) => [...prev, "Tech stack detected " + data.stack]);
      if (data.stack !== "unknown") {
        generateDockerfile(
          project.name || "",
          clonedPath || "",
          project.framework || ""
        );
      } else {
        CustomToast(
          "Couldn't detect tech stack. Please choose a different repository"
        );
      }
    } catch (error) {
      console.error(error);
      CustomToast("Error while detecting tech stack");
      setLogs((prev) => [...prev, "Error while detecting tech stack"]);
    }
  };

  const cloneRepo = async () => {
    try {
      const controller = new AbortController();

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/cloneRepo`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: project.github.repoName,
          cloneUrl: project.github.repositoryUrl + ".git",
          branch: project.github.branch,
        }),
      })
        .then((response) => {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          setLogs((prev) => [...prev, "Starting to clone the repository"]);
          const readChunk = () => {
            reader.read().then(({ done, value }) => {
              if (done) return;
              const text = decoder.decode(value);
              setLogs((prev) => [...prev, text]);

              const match = text.match(/\[CLONE_COMPLETE\] (.*)/);
              if (match) {
                let fullTargetDir = match[1];
                setLogs((prev) => [...prev, "Cloning complete"]);
                detectTechStack(fullTargetDir);
              }

              readChunk();
            });
          };

          readChunk();
        })
        .catch((err) => console.error("Streaming error:", err));

      return () => controller.abort();
    } catch (error) {
      console.error(error);
      CustomToast("Error while cloning");
      setLogs((prev) => [...prev, "Error while cloning the repo"]);
    }
  };

  const handleBuildAndPreview = async () => {
    setIsError(false);
    if (!project || !generateDockerfile) return;
    // generateDockerImage(project.name, "");
    setIsBuilding(true);
    try {
      await cloneRepo();
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

  const getDeploymentStatusColor = (status) => {
    switch (status) {
      case "in-progress":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getDeploymentStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Activity className="w-4 h-4 animate-pulse" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      case "cancelled":
        return <Clock className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(`${type}-${text}`);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
      <ToastContainer />
      <Navbar />
      <div className="p-6 mt-[80px]">
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
            <div className="space-y-8">
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
                              {project.name}
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
                            <span className="truncate">
                              {project.github.repositoryUrl}
                            </span>
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
                          {deployments?.length || 0}
                        </div>
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          Deployments
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {deployments && deployments.length > 0 && (
                <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl border border-purple-500/20 backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2c2f4a] to-[#1e1f3a] px-8 py-6 border-b border-gray-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                        <History className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">
                          Deployment History
                        </h4>
                        <p className="text-gray-400 text-sm">
                          Track all deployments for this project
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {deployments.map((deployment, index) => (
                        <div
                          key={deployment._id}
                          className="bg-[#2c2f4a]/50 rounded-2xl p-6 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.01]"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getDeploymentStatusColor(
                                  deployment.status
                                )}`}
                              >
                                {getDeploymentStatusIcon(deployment.status)}
                                {deployment.status}
                              </div>
                              <span className="text-gray-400 text-sm">
                                Version {deployment.version}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-white font-medium">
                                {formatDuration(
                                  deployment.startTime,
                                  deployment.endTime
                                )}
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(
                                  deployment.createdAt
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-purple-400" />
                                <span className="text-gray-400">Started:</span>
                                <span className="text-white">
                                  {new Date(
                                    deployment.startTime
                                  ).toLocaleString()}
                                </span>
                              </div>
                              {deployment.endTime && (
                                <div className="flex items-center gap-2 text-sm">
                                  {deployment.status === "failed" ? (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                  )}
                                  <span className="text-gray-400">
                                    {deployment.status === "failed"
                                      ? "Ended:"
                                      : "Completed:"}
                                  </span>
                                  <span className="text-white">
                                    {new Date(
                                      deployment.endTime
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-4 border-t border-gray-600/20">
                            {deployment.previewUrl &&
                              deployment.previewUrl !==
                                "undefined/tiptea/2" && (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={
                                      deployment.previewUrl.startsWith("http")
                                        ? deployment.previewUrl
                                        : `http://${deployment.previewUrl}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-300 font-medium transition-colors"
                                  >
                                    <Globe className="w-4 h-4" />
                                    View Live
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                  <button
                                    onClick={() =>
                                      copyToClipboard(
                                        deployment.previewUrl,
                                        "preview"
                                      )
                                    }
                                    className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-colors"
                                    title="Copy preview URL"
                                  >
                                    {copiedUrl ===
                                    `preview-${deployment.previewUrl}` ? (
                                      <Check className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-green-400" />
                                    )}
                                  </button>
                                </div>
                              )}

                            <div className="flex items-center gap-2">
                              <a
                                href={`/logs/${project.name}/${deployment._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 font-medium transition-colors"
                              >
                                <Code className="w-4 h-4" />
                                View Logs
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    `/logs/${project.name}/${deployment._id}`,
                                    "logs"
                                  )
                                }
                                className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                                title="Copy logs URL"
                              >
                                {copiedUrl ===
                                `logs-${`/logs/${project.name}/${deployment._id}`}` ? (
                                  <Check className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-blue-400" />
                                )}
                              </button>
                            </div>

                            {deployment.rollbackAvailable && (
                              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-300 font-medium transition-colors ml-auto">
                                <History className="w-4 h-4" />
                                Rollback Available
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <EnhancedLogDisplay
                  logs={logs}
                  isBuilding={isBuilding}
                  isError={isError}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
