"use client";

import CustomLoader from "@/components/CustomLoader";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  Github,
  GitBranch,
  Folder,
  X,
  Loader2,
  Check,
  AlertCircle,
  Upload,
  FileText,
  Archive,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import dotenv from "dotenv";
import Navbar from "@/components/Navbar";

dotenv.config();

const CreateProject = () => {
  const searchParams = useSearchParams();
  const repoName = searchParams.get("repo");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [repos, setRepos] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [branches, setBranches] = useState([]);
  const router = useRouter();
  const [isNameOk, setIsNameOk] = useState(false);
  const [creationMethod, setCreationMethod] = useState(
    localStorage.getItem("hasGithubPermission") === "true" ? "github" : "upload"
  );
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    repoName: "Select a repo",
    branch: "Select a branch",
    folder: "",
  });
  const [selectedRepo, setSelectedRepo] = useState(null);

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
    if (repoName) {
      setFormData({ ...formData, repoName: repoName });
    }
  }, []);

  useEffect(() => {
    repos.map((repo, i) => {
      if (repo.name === formData.repoName) {
        setSelectedRepo(repo);
      }
    });
  }, [formData.repoName]);

  useEffect(() => {
    const getBranches = async () => {
      if (formData.repoName === "Select a repo") {
        return;
      }
      try {
        const username = localStorage.getItem("githubUsername");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/github/getBranches?username=${username}&repoName=${formData.repoName}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setBranches(data.branch_names);
        setFormData({ ...formData, branch: data.branch_names[0] });
      } catch (error) {}
    };
    getBranches();
  }, [formData.repoName]);

  useEffect(() => {
    const getGithubRepos = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/github/getGithubRepos`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setRepos(data);
        if (repoName) {
          data.map((repo, i) => {
            if (repo.name === repoName) {
              setSelectedRepo(repo);
            }
          });
        }
      } catch (error) {
        console.error(error);
        CustomToast("Error while getting your repositories");
      }
    };
    getGithubRepos();
  }, []);

  const checkProjectName = async () => {
    if (formData.name.length < 5) {
      setIsNameOk(false);
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(formData.name)) {
      setIsNameOk(false);
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/checkName`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name }),
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.message === "Already exists") {
        setIsNameOk(false);
        setIsChecking(false);
        return;
      }
      setIsNameOk(true);
    } catch (error) {
      console.error(error);
      CustomToast("Error in checking name");
    }
    setIsChecking(false);
  };

  useEffect(() => {
    checkProjectName();
  }, [formData.name]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleFileUpload = (file) => {
    const allowedTypes = [
      "text/html",
      "application/zip",
      "application/x-zip-compressed",
    ];
    const allowedExtensions = [".html", ".htm", ".zip"];

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (
      allowedTypes.includes(file.type) ||
      allowedExtensions.includes(fileExtension)
    ) {
      setUploadedFile(file);
    } else {
      alert("Please upload only HTML files (.html, .htm) or ZIP files (.zip)");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "zip")
      return <Archive className="w-5 h-5 text-purple-400" />;
    return <FileText className="w-5 h-5 text-blue-400" />;
  };

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  const createProject = async (stack, clonedPath) => {
    if (isNameOk) {
      setIsCreating(true);
      try {
        if (creationMethod === "github") {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/createByGithub`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: formData.name,
                branch: formData.branch,
                folder: formData.folder,
                framework: stack,
                repositoryUrl: selectedRepo.html_url,
                repoName: selectedRepo.name,
                clonedPath,
              }),
              credentials: "include",
            }
          );
          const data = await response.json();
          if (response.status === 409) {
            CustomToast("A project for this repo already exists");
          }
          if (response.ok) {
            setIsCreating(false);
            router.push(`/projects/${formData.name}`);
          }
        } else {
          if (!uploadedFile) {
            CustomToast("Please upload a file");
            setIsCreating(false);
            return;
          }
          const sendingFormData = new FormData();
          sendingFormData.append("zip", uploadedFile);
          sendingFormData.append("name", formData.name);
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/createByZip`,
            {
              method: "POST",
              credentials: "include",
              body: sendingFormData,
            }
          );
          const data = await response.json();
          if (response.ok) {
            setIsCreating(false);
            router.push(`/projects/${formData.name}`);
          }
        }
      } catch (error) {
        console.error(error);
        CustomToast("Error in creating project");
      }
      setIsCreating(false);
    }
  };

  const detectTechStack = async (clonedPath) => {
    try {
      console.log("checking");
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
      if (data.stack !== "unknown" && data.stack) {
        createProject(data.stack, clonedPath);
      } else {
        CustomToast(
          "Couldn't detect tech stack. Please choose a different repository"
        );
      }
    } catch (error) {
      console.error(error);
      CustomToast("Error while detecting tech stack");
    }
  };

  const cloneRepo = async () => {
    if (isNameOk) {
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
            repoName: selectedRepo.name,
            cloneUrl: selectedRepo.clone_url,
            branch: formData.branch,
          }),
        })
          .then((response) => {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            const readChunk = () => {
              reader.read().then(({ done, value }) => {
                if (done) return;
                const text = decoder.decode(value);

                const match = text.match(/\[CLONE_COMPLETE\] (.*)/);
                if (match) {
                  let fullTargetDir = match[1];
                  console.log("cloned");
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
      }
    } else {
      CustomToast("Enter a valid project name");
    }
  };

  const isFormValid =
    formData.name &&
    isNameOk &&
    (creationMethod === "github"
      ? formData.repoName !== "Select a repo" &&
        formData.branch !== "Select a branch"
      : uploadedFile !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3] flex items-center justify-center py-8 px-4">
      <ToastContainer />
      <Navbar />
      <div className="bg-gradient-to-br mt-[100px] from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 w-full max-w-3xl border border-purple-500/20 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-4 shadow-lg">
            <Github className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
            Create New Project
          </h1>
          <p className="text-gray-400 text-lg">
            Deploy your repository or upload your files
          </p>
        </div>

        {/* Creation Method Toggle */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#2c2f4a]/50 rounded-2xl p-2 border border-gray-600/30">
              <div className="flex">
                <button
                  onClick={() => {
                    if (localStorage.getItem("hasGithubPermission") === "true")
                      setCreationMethod("github");
                    else CustomToast("Connect github on dashboard first");
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    creationMethod === "github"
                      ? "bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Github className="w-5 h-5" />
                  GitHub Repository
                </button>
                <button
                  onClick={() => setCreationMethod("upload")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    creationMethod === "upload"
                      ? "bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white shadow-lg"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  Upload Files
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <label className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              Project Name
            </label>
            <div className="relative">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="off"
                    className="w-full p-4 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 backdrop-blur-sm"
                    placeholder="Enter your project name"
                  />
                  {formData.name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isNameOk ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={checkProjectName}
                  disabled={!formData.name.trim() || isChecking}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white font-semibold shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {isChecking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Check"
                  )}
                </button>
              </div>
              {formData.name && (
                <div
                  className={`mt-3 flex items-center gap-2 text-sm transition-all duration-300 ${
                    isNameOk ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {isNameOk ? (
                    <>
                      <Check className="w-4 h-4" />
                      Project name is available
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Choose a different project name
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* GitHub Repository Section */}
          {creationMethod === "github" && (
            <>
              {/* Repository Selection */}
              <div className="space-y-2">
                <label className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Repository
                </label>
                <div className="relative">
                  <select
                    name="repoName"
                    value={formData.repoName}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer backdrop-blur-sm"
                  >
                    <option value="Select a repo" disabled>
                      Select a repository
                    </option>
                    {repos.map((repo) => (
                      <option
                        key={repo.name}
                        value={repo.name}
                        className="bg-[#2c2f4a] text-white"
                      >
                        {repo.name}
                      </option>
                    ))}
                  </select>
                  <Github className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Branch Selection */}
              <div className="space-y-2">
                <label className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Branch
                </label>
                <div className="relative">
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full p-4 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer backdrop-blur-sm"
                    disabled={formData.repoName === "Select a repo"}
                  >
                    <option value="Select a branch" disabled>
                      Select a branch
                    </option>
                    {branches.map((branch, i) => (
                      <option
                        key={i}
                        value={branch}
                        className="bg-[#2c2f4a] text-white"
                      >
                        {branch}
                      </option>
                    ))}
                  </select>
                  <GitBranch className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Folder */}
              {/*<div className="space-y-2">
                <label className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  Folder{" "}
                  <span className="text-gray-500 text-xs normal-case">
                    (optional)
                  </span>
                </label>
                <div className="relative">
                  <input
                    value={formData.folder}
                    onChange={handleChange}
                    name="folder"
                    type="text"
                    placeholder="Folder path (leave empty if not needed)"
                    className="w-full p-4 rounded-xl bg-[#2c2f4a]/80 text-white border border-gray-600/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 backdrop-blur-sm"
                  />
                  <Folder className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>*/}
            </>
          )}

          {/* File Upload Section */}
          {creationMethod === "upload" && (
            <div className="space-y-4">
              {/* Upload Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-300 font-semibold mb-2">
                      File Upload Requirements
                    </h4>
                    <ul className="text-blue-200 text-sm space-y-1">
                      <li>
                        • Upload an HTML file (.html, .htm) or a ZIP archive
                        (.zip)
                      </li>
                      <li>
                        • For ZIP files of static sites: ensure there's an{" "}
                        <code className="bg-blue-900/30 px-1 rounded">
                          index.html
                        </code>{" "}
                        file in the main folder
                      </li>
                      <li>• Maximum file size: 50MB</li>
                      <li>
                        • The index.html file will be used as the entry point
                        for your static application
                      </li>
                      <li>
                        • For zip files of framework website, ensure you're not
                        adding node_modules
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="space-y-2">
                <label className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Upload Files
                </label>

                {!uploadedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer hover:border-purple-500/50 ${
                      dragActive
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-gray-600/50 bg-[#2c2f4a]/30"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".html,.htm,.zip"
                      onChange={handleFileInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
                        <Upload className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg mb-2">
                          Drop your files here or click to browse
                        </p>
                        <p className="text-gray-400 text-sm">
                          Supports HTML files and ZIP archives
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#2c2f4a]/80 rounded-xl p-4 border border-gray-600/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getFileIcon(uploadedFile.name)}
                        <div>
                          <p className="text-white font-medium">
                            {uploadedFile.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors"
                        title="Remove file"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Button */}
          <div className="pt-4">
            <button
              onClick={creationMethod === "github" ? cloneRepo : createProject}
              type="button"
              disabled={!isFormValid || isCreating}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl transition-all duration-500 flex items-center justify-center gap-3 ${
                isFormValid && !isCreating
                  ? "bg-gradient-to-r from-[#00aaff] via-[#0099ff] to-[#9a00ff] text-white hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.02] transform"
                  : "bg-gray-600/50 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  {creationMethod === "github" ? (
                    <Github className="w-6 h-6" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                  Create Project
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                (step === 1 && formData.name && isNameOk) ||
                (step === 2 &&
                  (creationMethod === "github"
                    ? formData.repoName !== "Select a repo"
                    : uploadedFile !== null)) ||
                (step === 3 && isFormValid)
                  ? "bg-gradient-to-r from-blue-400 to-purple-500"
                  : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
