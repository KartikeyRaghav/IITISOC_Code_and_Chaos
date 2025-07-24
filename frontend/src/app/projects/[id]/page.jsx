"use client";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ToastContainer } from "react-toastify";
import { checkAuth } from "@/utils/checkAuth";
import { useProjectDetails } from "./hooks/useProjectDetails";
import { useDeployment } from "./hooks/useDeployment";
import CustomLoader from "@/components/CustomLoader";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProjectHeader from "./components/ProjectHeader";
import ProjectInfo from "./components/ProjectInfo";
import BuildDeployCard from "./components/BuildDeployCard";
import DeploymentHistory from "./components/DeploymentHistory";
import EnhancedLogDisplay from "@/components/EnhancedLogDisplay";

const ProjectDetails = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const {
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
  } = useProjectDetails();

  const { handleBuildAndPreview, deployToProduction } = useDeployment(
    projectName,
    setLogs,
    setIsBuilding,
    setIsError
  );

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
    console.log(logs);
  }, [logs]);

  const onBuildAndPreview = () => {
    handleBuildAndPreview(project);
  };

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
      <ToastContainer />
      <Navbar />
      <div className="p-6 pt-[104px]">
        <div className="max-w-6xl mx-auto">
          <ProjectHeader />

          {!project ? (
            <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-12 text-center border border-purple-500/20 backdrop-blur-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-full mb-6 shadow-lg">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Loading Project
              </h2>
              <p className="text-gray-400">Fetching project details...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  <ProjectInfo project={project} isBuilding={isBuilding} />
                </div>

                <div className="space-y-6">
                  <BuildDeployCard
                    isBuilding={isBuilding}
                    onBuildAndPreview={onBuildAndPreview}
                    logsCount={logs.length}
                    deploymentsCount={deployments?.length || 0}
                  />
                </div>
              </div>

              <DeploymentHistory
                deployments={deployments}
                projectName={projectName}
                copiedUrl={copiedUrl}
                onCopyToClipboard={copyToClipboard}
                onDeployToProduction={deployToProduction}
                project={project}
              />

              <div>
                <EnhancedLogDisplay
                  logs={logs}
                  isBuilding={isBuilding}
                  isError={isError}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetails;
