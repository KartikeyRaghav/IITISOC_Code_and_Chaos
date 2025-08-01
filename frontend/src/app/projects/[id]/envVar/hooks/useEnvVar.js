"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export const useEnvironmentVariables = () => {
  const [envVars, setEnvVars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const projectName = usePathname().split("/")[2];
  const [projectId, setProjectId] = useState(null);

  useEffect(() => {
    const getProject = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/getProject?projectName=${projectName}`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data) {
          setProjectId(data._id);
        } else {
          CustomToast("Error fetching project");
          setTimeout(() => {
            router.replace("/projects");
          }, 2000);
        }
      } catch (error) {
        console.error(error);
        CustomToast("Error fetching project");
        setTimeout(() => {
          router.replace("/projects");
        }, 2000);
      }
    };
    getProject();
  }, [projectName]);

  useEffect(() => {
    if (projectId) {
      fetchEnvironmentVariables();
    }
  }, [projectId]);

  const fetchEnvironmentVariables = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/envvars/${projectId}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setEnvVars(data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch environment variables");
      setLoading(false);
    }
  };

  const addEnvironmentVariable = async (envVar) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/envvars/`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: envVar.key,
            value: envVar.value,
            isSecret: envVar.isSecret,
            environment: envVar.environment,
            projectId: projectId,
          }),
        }
      );
      const data = await response.json();
      setEnvVars([...envVars, data.data]);
      setLoading(false);
      return data.data;
    } catch (err) {
      setError("Failed to add environment variable");
      setLoading(false);
      throw err;
    }
  };

  const updateEnvironmentVariable = async (envVar) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/envvars/${envVar._id}`,
        {
          credentials: "include",
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...envVar,
          }),
        }
      );
      const data = await response.json();
      setEnvVars(
        envVars.map((env) => {
          if (env._id !== envVar._id) return env;
          else return data.data;
        })
      );
      setLoading(false);
    } catch (err) {
      setError("Failed to update environment variable");
      setLoading(false);
      throw err;
    }
  };

  const deleteEnvironmentVariable = async (_id) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/envvars/${_id}`,
        {
          credentials: "include",
          method: "DELETE",
        }
      );
      const data = await response.json();
      setEnvVars((prev) => prev.filter((envVar) => envVar._id !== _id));
      setLoading(false);
    } catch (err) {
      setError("Failed to delete environment variable");
      setLoading(false);
      throw err;
    }
  };

  return {
    envVars,
    loading,
    error,
    addEnvironmentVariable,
    updateEnvironmentVariable,
    deleteEnvironmentVariable,
    refetch: fetchEnvironmentVariables,
  };
};
