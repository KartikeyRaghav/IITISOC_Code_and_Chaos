"use client";

import CustomLoader from "@/components/CustomLoader";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const page = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [projects, setProjects] = useState([]);

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
    const getProjects = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/getAllProjects`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        CustomToast("Error fetching your projects");
      }
    };
    getProjects();
  }, []);

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <div>
      {projects.map((project, i) => (
        <button
          key={i}
          onClick={() => router.push(`/analytics/${project._id}`)}
        >
          {project._id}
        </button>
      ))}
    </div>
  );
};

export default page;
