"use client";

import CustomLoader from "@/components/CustomLoader";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const CreateProject = () => {
  const [logs, setLogs] = useState([]);
  const searchParams = useSearchParams();
  const repoName = searchParams.get("repo");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [repos, setRepos] = useState([]);
  const [branches, setBranches] = useState([]);
  const router = useRouter();
  const [isNameOk, setIsNameOk] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    repoName: "Select a repo",
    branch: "",
    folder: "",
  });

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
    const getBranches = async () => {
      if (formData.repoName === "Select a repo") {
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:3001/api/v1/github/getBranches`,
          {
            method: "POST",
            body: JSON.stringify({
              username: localStorage.getItem("githubUsername"),
              repoName: formData.repoName,
            }),
          }
        );
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
      } catch (error) {
        console.log(error);
        CustomToast("Error while getting your repositories");
      }
    };
    getUserRepos();
  }, []);

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

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
        }
      );
      const data = response.json();
      if (data.message === "Already exists") {
        CustomToast("Project Name already exists");
        setIsNameOk(false);
        return;
      }
      setIsNameOk(true);
    } catch (error) {}
  };

  const runDockerContainer = async (repo, imageName) => {
    try {
      setLogs((prev) => [...prev, "Starting docker container run"]);
      const controller = new AbortController();

      fetch(`http://localhost:3001/api/v1/build/dockerContainer`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: repo.name,
          imageName,
          port: 8081,
        }),
      })
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
                setUrl(url);
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

  const generateDockerImage = async (repo, clonedPath) => {
    try {
      setLogs((prev) => [...prev, "Starting docker image build"]);
      const controller = new AbortController();

      fetch(`http://localhost:3001/api/v1/build/dockerImage`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: repo.name,
          clonedPath,
        }),
      })
        .then((response) => {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          const readChunk = () => {
            reader.read().then(({ done, value }) => {
              if (done) return;
              const text = decoder.decode(value);
              setLogs((prev) => [...prev, text]);

              const match = text.match(/\[BUILD_COMPLETE\] (.*)/);
              if (match) {
                let fullImageName = match[1];
                console.log("Build complete. Image name:", fullImageName);
                setLogs((prev) => [...prev, "Build complete"]);
                runDockerContainer(repo, fullImageName);
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

  const generateDockerfile = async (repo, clonedPath, techStack) => {
    try {
      setLogs((prev) => [...prev, "Generating dockerfile"]);
      const response = await fetch(
        `http://localhost:3001/api/v1/build/dockerFile`,
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
      generateDockerImage(repo, clonedPath);
    } catch (error) {
      console.log(error);
      CustomToast("Error while generating dockerfile");
      setLogs((prev) => [...prev, "Error while generating dockerfile"]);
    }
  };

  const detectTechStack = async (repo, clonedPath) => {
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

      generateDockerfile(repo, clonedPath, data.stack);
    } catch (error) {
      console.log(error);
      CustomToast("Error while detecting tech stack");
      setLogs((prev) => [...prev, "Error while detecting tech stack"]);
    }
  };

  const cloneRepo = async (repo) => {
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
          repoName: repo.name,
          cloneUrl: repo.clone_url,
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
                detectTechStack(repo, fullTargetDir);
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
  };

  return (
    <div>
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
