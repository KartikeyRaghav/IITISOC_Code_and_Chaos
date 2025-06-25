"use client";
import CustomToast from "@/components/CustomToast";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import dotenv from "dotenv";

dotenv.config();

const Project = () => {
  const [repos, setRepos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/getAllProjects`,
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-6">Your Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No projects found.
          </div>
        )}
        {repos.map((project) => (
          <div
            key={project.id}
            onClick={() => {
              router.push(`/project/${project.name}`);
            }}
            className="bg-white shadow rounded-lg p-6 flex flex-col"
          >
            <h2 className="text-lg font-semibold mb-2">{project.name}</h2>
            <p className="text-gray-600 mb-4">
              {project.description || "No description available"}
            </p>
            <div className="text-xs text-gray-400 mt-auto">
              Created on:{" "}
              {project.createdAt
                ? new Date(project.createdAt).toLocaleString()
                : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Project;
