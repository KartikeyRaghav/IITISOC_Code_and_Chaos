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

  const createProject = async (stack, clonedPath) => {
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
              repoName: selectedRepo.name,
              clonedPath,
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
    <div className="min-h-screen bg-gradient-to-br from-[#004466] to-[#6a00b3] flex items-center justify-center py-8">
      <ToastContainer />
      <div className="bg-[#23243a] rounded-2xl shadow-xl p-8 w-full max-w-3xl flex flex-xol md:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-white mb-2 border-b-2 border-purple-500 pb-2">
            Create a New Project
          </h1>
          <label className="text-gray-300 font-medium">Project Name</label>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="flex-1 p-3 rounded bg-[#2c2f4a] text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Enter project name"
            />
            <button
              type="button"
              onClick={checkProjectName}
              className="px-4 py-2 rounded bg-gradient-to-r from-custom-blue-300 via-[#00aaff] to-[#9a00ff] text-white font-semibold shadow hover:from-[#002233] hover:via-[#0096e6] hover:to-[#5a0099] transition"
            >
              Check
            </button>
          </div>

          <label className="text-gray-300 font-medium mt-2">Select Repo</label>
          <select
            name="repoName"
            id="repoName"
            value={formData.repoName}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#2c2f4a] text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="Select a repo">Select a repo</option>
            {repos.map((repo, i) => (
              <option key={i} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>

          <label className="text-gray-300 font-medium mt-2">
            Select Branch
          </label>
          <select
            name="branch"
            id="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-full p-3 rounded bg-[#2c2f4a] text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          >
            <option value="Select a branch">Select a branch</option>
            {branches.length > 0 &&
              branches.map((branch, i) => (
                <option key={i} value={branch}>
                  {branch}
                </option>
              ))}
          </select>

          <label className="text-gray-300 font-medium mt-2">
            Folder (optional)
          </label>
          <input
            value={formData.folder}
            onChange={handleChange}
            name="folder"
            type="text"
            placeholder="Folder name (Leave empty if not needed)"
            className="w-full p-3 rounded bg-[#2c2f4a] text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />

          <button
            onClick={cloneRepo}
            type="button"
            className="w-full py-3 mt-4 rounded bg-gradient-to-r from-custom-blue-300 via-[#00aaff] to-[#9a00ff] text-white font-semibold text-lg shadow hover:from-[#002233] hover:via-[#0096e6] hover:to-[#5a0099] transition"
          >
            Create project
          </button>
        </div>

        
      </div>
    </div>
  );
};

export default CreateProject;

/* "use client";
import CustomToast from "@/components/CustomToast";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Select from "react-select";

const Project = () => {
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/v1/project/getAllProjects`,
          { credentials: "include" }
        );
        const data = await response.json();
        setRepos(data);
        console.log(data);
      } catch (error) {
        CustomToast("Error fetching your projects");
      }
    };
    getProjects();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepo) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.github.com/repos/${selectedRepo.owner.login}/${selectedRepo.name}/branches`,
          {
            headers: {
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json"
            }
          }
        );
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        CustomToast("Error fetching branches");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBranches();
  }, [selectedRepo]);

  const handleDelpoyment = async () => {
    try {
      const response = await fetch(`https://localhost:3001/api/v1/deploy`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: selectedRepo.name,
          owner: selectedRepo.owner.login,
          branch: selectedBranch.value
      })
    })

    const data = await response.json();
    if (response.ok) {
      CustomToast(data.message || 'Deployment started successfully!')
    } else {
      CustomToast(data.error || 'Deployment failed')
    } 
  } catch (error) {
    CustomToast('Deployment request failed')
  }
};

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Project Deployment Dashboard</h1>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Repo:</label>
        <Select
          options={repos.map(repo => ({
            value:repo.id,
            label:repo.name,
            repoObject: repo
          }))}
          onChange={(selected) => 
            setSelectedRepo(selected, repoObject)}
            placeholder="Choose a repo"
            className="react-select-container"
            classNamePrefix="react-select"
          />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Select Branch:</label>
        <Select 
          options={branches.map(branch => ({
            value: branch.name,
            label: branch.name
          }))}
          onChange={setSelectedBranch}
          isDisabled={!selectedRepo || isLoading}
          isLoading={isLoading}
          placeholder={isLoading ? "Loading branches..." : "Choose a branch"}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      <button
        onClick={handleDelpoyment}
        disabled={!selectedBranch}
        className={`px-4 py-2 rounded-md ${
          selectedBranch
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Deploy Project
      </button>
    </div>
  );
};

export default Project;
*/
