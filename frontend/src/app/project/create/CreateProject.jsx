"use client";

import CustomLoader from "@/components/CustomLoader";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Github, GitBranch, Folder, X, Loader2, Check } from "lucide-react";
import { ToastContainer } from "react-toastify";
import dotenv from "dotenv";

dotenv.config();

const CreateProject = () => {
  const [logs, setLogs] = useState([]);
  const searchParams = useSearchParams();
  const repoName = searchParams.get("repo");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [repos, setRepos] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [branches, setBranches] = useState([]);
  const router = useRouter();
  const [isNameOk, setIsNameOk] = useState(false);
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
          `/api/v1/github/getBranches?username=${username}&repoName=${formData.repoName}`,
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
    const getUserRepos = async () => {
      try {
        const response = await fetch(`/api/v1/users/getUserRepos`, {
          credentials: "include",
        });
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
        console.log(error);
        CustomToast("Error while getting your repositories");
      }
    };
    getUserRepos();
  }, []);

  const checkProjectName = async () => {
    if (formData.name.length < 5) {
      setIsNameOk(false);
      CustomToast("Project name should be atleast 5 letters");
      return;
    }

    setIsChecking(true);

    try {
      const response = await fetch(`/api/v1/project/checkName`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name }),
        credentials: "include",
      });
      const data = await response.json();
      console.log(data);
      if (data.message === "Already exists") {
        CustomToast("Project Name already exists");
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

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  const createProject = async (stack, clonedPath) => {
    if (isNameOk) {
      setIsCreating(true);
      try {
        const response = await fetch(`/api/v1/project/create`, {
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
        });

        const data = await response.json();
        if (response.status === 409) {
          CustomToast("A project for this repo already exists");
        }
        if (response.ok) {
          setIsCreating(false);
          router.push(`/project/${formData.name}`);
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
      setLogs((prev) => [...prev, "Detecting tech stack"]);
      const response = await fetch(`/api/v1/build/detectTechStack`, {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          clonedPath,
        }),
      });
      const data = await response.json();
      setLogs((prev) => [...prev, "Tech stack detected " + data.stack]);
      if (data.stack !== "unknown") {
        createProject(data.stack, clonedPath);
      }
    } catch (error) {
      console.log(error);
      CustomToast("Error while detecting tech stack");
      setLogs((prev) => [...prev, "Error while detecting tech stack"]);
    }
  };

  const cloneRepo = async () => {
    if (isNameOk) {
      try {
        const controller = new AbortController();

        fetch(`/api/v1/build/cloneRepo`, {
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
            setLogs((prev) => [...prev, "Starting to clone the repository"]);
            const readChunk = () => {
              reader.read().then(({ done, value }) => {
                if (done) return;
                const text = decoder.decode(value);
                setLogs((prev) => [...prev, text]);

                const match = text.match(/\[CLONE_COMPLETE\] (.*)/);
                if (match) {
                  let fullTargetDir = match[1];
                  console.log("Clone complete. Target Dir:", fullTargetDir);
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
        console.log(error);
        CustomToast("Error while cloning");
        setLogs((prev) => [...prev, "Error while cloning the repo"]);
      }
    } else {
      CustomToast("Enter a valid project name");
    }
  };

  const isFormValid =
    formData.name &&
    isNameOk &&
    formData.repoName !== "Select a repo" &&
    formData.branch !== "Select a branch";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3] flex items-center justify-center py-8 px-4">
      <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-purple-500/20 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-4 shadow-lg">
            <Github className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
            Create New Project
          </h1>
          <p className="text-gray-400 text-lg">
            Deploy your repository with ease
          </p>
        </div>

        <div className="space-y-6">
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

          <div className="space-y-2">
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
          </div>

          <div className="pt-4">
            <button
              onClick={cloneRepo}
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
                  <Github className="w-6 h-6" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                (step === 1 && formData.name && isNameOk) ||
                (step === 2 && formData.repoName !== "Select a repo") ||
                (step === 3 && formData.branch !== "Select a branch") ||
                (step === 4 && isFormValid)
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
