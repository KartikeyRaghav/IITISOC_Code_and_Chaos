import CustomToast from "@/components/CustomToast";
import dotenv from "dotenv";
import { useProjectDetails } from "./useProjectDetails";

dotenv.config();

export const useDeployment = (
  projectName,
  setLogs,
  setIsBuilding,
  setIsError
) => {
  const { getDeployments } = useProjectDetails();

  const updateDeployment = async (deploymentId, status) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/update`,
        {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          method: "PUT",
          body: JSON.stringify({ _id: deploymentId, status }),
        }
      );
      const data = await response.json();
    } catch (error) {}
  };

  const getVersion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/version`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName,
          }),
        }
      );

      const data = await response.json();
      return data.version;
    } catch (error) {}
  };

  const createDeployment = async () => {
    try {
      const prevVersion = await getVersion();
      const version = (Number(prevVersion) + 1).toString();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/create`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName,
            version,
            status: "pending",
          }),
          method: "POST",
          credentials: "include",
        }
      );
      const data = await response.json();
      return data._id;
    } catch (error) {
      console.error(error);
      CustomToast("Error making a new deployment");
    }
  };

  const generateDockerImage = async (projectName, clonedPath, deploymentId) => {
    try {
      setLogs((prev) => [...prev, "Starting docker image build"]);
      const controller = new AbortController();

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/dockerImage`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          clonedPath,
          deploymentId,
        }),
      })
        .then((response) => {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          const readChunk = () => {
            reader.read().then(async ({ done, value }) => {
              if (done) return;
              const text = decoder.decode(value);
              setLogs((prev) => [...prev, text]);

              const match = text.match(/\[BUILD_COMPLETE\] (.*)/);
              const error = text.match(/\[ERROR\] (.*)/);
              if (match) {
                let fullImageName = match[1];
                setLogs((prev) => [...prev, "Build complete"]);
                await updateDeployment(deploymentId, "in-preview");
                setIsBuilding(false);
              }
              if (error) {
                setIsBuilding(false);
                await updateDeployment(deploymentId, "failed");
                setIsError(true);
                CustomToast("Error building the docker image");
              }

              readChunk();
            });
          };

          readChunk();
        })
        .catch((err) => console.error("Streaming error:", err));

      () => controller.abort();
    } catch (error) {
      console.error(error);
      CustomToast("Error while building dockerimage");
      setLogs((prev) => [...prev, "Error while building docker image"]);
    }
  };

  const generateDockerfile = async (projectName, clonedPath, techStack) => {
    try {
      setLogs((prev) => [...prev, "Generating dockerfile"]);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/dockerFile`,
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
      const deploymentId = await createDeployment();
      generateDockerImage(projectName, clonedPath, deploymentId);
    } catch (error) {
      console.error(error);
      CustomToast("Error while generating dockerfile");
      setLogs((prev) => [...prev, "Error while generating dockerfile"]);
    }
  };

  const detectTechStack = async (clonedPath, project) => {
    try {
      setLogs((prev) => [...prev, "Detecting tech stack"]);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/detectTechStack`,
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
        generateDockerfile(
          project.name || "",
          clonedPath || "",
          project.framework || ""
        );
      } else {
        CustomToast(
          "Couldn't detect tech stack. Please choose a different repository"
        );
      }
    } catch (error) {
      console.error(error);
      CustomToast("Error while detecting tech stack");
      setLogs((prev) => [...prev, "Error while detecting tech stack"]);
    }
  };

  const cloneRepo = async (project) => {
    try {
      const controller = new AbortController();

      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/build/cloneRepo`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: project.github.repoName,
          cloneUrl: project.github.repositoryUrl + ".git",
          branch: project.github.branch,
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
                setLogs((prev) => [...prev, "Cloning complete"]);
                detectTechStack(fullTargetDir, project);
              }

              readChunk();
            });
          };

          readChunk();
        })
        .catch((err) => console.error("Streaming error:", err));

      return () => controller.abort();
    } catch (error) {
      console.error(error);
      CustomToast("Error while cloning");
      setLogs((prev) => [...prev, "Error while cloning the repo"]);
    }
  };

  const deploy = async (deployment, isLive) => {
    try {
      setIsBuilding(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment/deploy`,
        {
          credentials: "include",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deploymentId: deployment._id,
            projectName,
            isLive,
          }),
        }
      );
      const data = await response.json();
      if (isLive) await updateDeployment(deployment._id, "deployed");
      await getDeployments();
    } catch (error) {
      console.error(error);
      CustomToast("Error deploying to production");
    } finally {
      setIsBuilding(false);
    }
  };

  const handleBuildAndPreview = async (project) => {
    setIsError(false);
    if (!project) return;
    setIsBuilding(true);
    try {
      await cloneRepo(project);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    handleBuildAndPreview,
    deploy,
  };
};
