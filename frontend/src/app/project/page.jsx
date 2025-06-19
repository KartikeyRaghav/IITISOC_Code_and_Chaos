"use client";
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
