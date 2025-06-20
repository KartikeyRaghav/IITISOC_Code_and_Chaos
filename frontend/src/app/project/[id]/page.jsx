"use client";
import CustomToast from "@/components/CustomToast";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProjectPage = () => {
  const projectName = usePathname().split("/")[2];
  const router = useRouter();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const getProject = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/api/v1/project/getProject?projectName=${projectName}`,
          { credentials: "include" }
        );
        const data = await response.json();
        console.log(data);
        setProject(data);
      } catch (error) {
        console.error(error);
        CustomToast("Error fetching project");
        setTimeout(() => {
          router.replace("/project");
        }, 2000);
      }
    };
    getProject();
  }, [projectName]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] to-[#6a00b3] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">
          Project Details
        </h1>
        {!project ? (
          <div className="bg-[#23243a] rounded-2xl shadow-xl p-8 text-center">
            <p className="text-white">Loading project details...</p>
          </div>
        ) : (
          <div className="bg-[#23243a] rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {project.project_name || project.name}
              </h2>
              <p className="text-gray-300 mb-4">
                {project.description || "No description available"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-gray-400">
                  <span className="ml-2">{project.repoName || project.repositoryName || "N/A"}</span>
                </div>
                <div className="text-gray-400">
                  <span className="font-semibold text-purple-300">
                    Branch:
                  </span>
                  <span className="ml-2">{project.branch || "N/A"}</span>
                </div>
                {project.folder && (
                  <div className="text-gray-400">
                    <span className="font-semibold text-purple-500">
                      Folder:
                    </span>
                    <span className="ml-2">{project.folder}</span>
                  </div>
                )}
                <div className="text-gray-400 text-sm">
                  <span className="font-semibold">Created at:</span>{" "}
                  {project.created_at ? new Date(project.created_at).toLocaleString() : "N/A"}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Build & Deployment</h3>
                <button
                  onClick={() =>
                    generateDockerfile(project.repo, project.clonedPath, project.techStack)
                  }
                  className="px-4 py-2 rounded:md font-medium bg-gradient-to-r from-custom-blue-300 via-[#00aaff] to-[#9a00ff] hover:from-[#002233] hover:via-[#0096e6] hover:to-[#5a0099] text-white transition"
                >
                  Build and Deploy 
                </button>
              </div>
              <div className="bg-[#18192b] rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="text-purple-300 font-medium mb-2">Build Logs</h4>
                <div className="font-mono text-green-300 text-sm space-y-1">
                  {logs && logs.length === 0 ? (
                    <p className="text-gray-500">No logs yet. Start a build to see progress.</p>
                  ) : (
                    logs.map((log, index) => (
                      <div className="whitespace-pre-wrap" key={index}>{log}</div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
};

export default ProjectPage;
