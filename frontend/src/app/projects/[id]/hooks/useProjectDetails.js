import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import CustomToast from "@/components/CustomToast";
import dotenv from "dotenv";

dotenv.config();

export const useProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isError, setIsError] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const projectName = usePathname().split("/")[2];
  const router = useRouter();

  useEffect(() => {
    const getProject = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/project/getProject?projectName=${projectName}`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data) setProject(data);
        else {
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

  const getDeployments = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/all?projectName=${projectName}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setDeployments(data.reverse());
    } catch (error) {
      console.error(error);
      CustomToast("Error fetching project");
    }
  };

  useEffect(() => {
    getDeployments();
  }, [projectName, isBuilding]);

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(`${type}-${text}`);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return {
    project,
    deployments,
    logs,
    setLogs,
    isBuilding,
    setIsBuilding,
    isError,
    setIsError,
    copiedUrl,
    copyToClipboard,
    projectName,
    router,
    getDeployments,
  };
};
