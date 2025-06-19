"use client";

import CustomLoader from "@/components/CustomLoader";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

const CreateProject = () => {
  const [logs, setLogs] = useState([]);
  const searchParams = useSearchParams();
  const repoName = searchParams.get("repo");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [repos, setRepos] = useState([]);
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
          `http://localhost:3001/api/v1/github/getBranches?username=${username}&repoName=${formData.repoName}`,
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
        const response = await fetch(
          "http://localhost:3001/api/v1/users/getUserRepos",
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
        console.log(error);
        CustomToast("Error while getting your repositories");
      }
    };
    getUserRepos();
  }, []);

  const checkProjectName = async () => {
    if (formData.name.length < 5) {
      CustomToast("Project name should be atleast 5 letters");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/v1/project/checkName",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: formData.name }),
          credentials: "include",
        }
      );
      const data = response.json();
      if (data.message === "Already exists") {
        CustomToast("Project Name already exists");
        setIsNameOk(false);
        return;
      }
      setIsNameOk(true);
    } catch (error) {
      console.error(error);
      CustomToast("Error in checking name");
    }
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

  const createProject = async (stack) => {
    if (isNameOk) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/v1/project/create`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              branch: formData.branch,
              folder: formData.folder,
              framework: stack,
              repositoryUrl: selectedRepo.html_url,
            }),
            credentials: "include",
          }
        );

        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error(error);
        CustomToast("Error in creating project");
      }
    }
  };

  const detectTechStack = async (clonedPath) => {
    try {
      setLogs((prev) => [...prev, "Detecting tech stack"]);
      const response = await fetch(
        `http://localhost:3001/api/v1/build/detectTechStack`,
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
        createProject(data.stack);
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

        fetch(`http://localhost:3001/api/v1/build/cloneRepo`, {
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
      CustomToast("Project Name");
    }
  };

  return (
    <div>
      <ToastContainer />
      <div>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <button onClick={checkProjectName}>Check</button>
      </div>
      <div>
        <select
          name="repoName"
          id="repoName"
          value={formData.repoName}
          onChange={handleChange}
        >
          <option value="Select a repo">Select a repo</option>
          {repos.map((repo, i) => (
            <option key={i} value={repo.name}>
              {repo.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <select
          name="branch"
          id="branch"
          value={formData.branch}
          onChange={handleChange}
        >
          <option value="Select a branch">Select a branch</option>
          {branches.length > 0 &&
            branches.map((branch, i) => (
              <option key={i} value={branch}>
                {branch}
              </option>
            ))}
        </select>
      </div>
      <input
        value={formData.folder}
        onChange={handleChange}
        type="text"
        placeholder="Folder name (Leave empty if no frontend folder)"
      />
      <br />
      <button onClick={cloneRepo}>Create project</button>
      <div className="mt-8 bg-black/90 border border-[#ad65dd] text-green-200 p-6 rounded-xl h-60 overflow-y-scroll font-mono text-sm shadow-inner">
        <div className="mb-2 text-[#ad65dd] font-semibold">Deployment Logs</div>
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="whitespace-pre-line">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
