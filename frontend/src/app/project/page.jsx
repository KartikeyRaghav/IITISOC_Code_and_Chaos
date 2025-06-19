"use client";
import CustomToast from "@/components/CustomToast";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

const Project = () => {
  const [repos, setRepos] = useState([]);

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

  return (
    <div>
      <ToastContainer />
    </div>
  );
};

export default Project;
