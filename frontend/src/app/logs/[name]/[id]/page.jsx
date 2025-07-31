"use client";

import CustomLoader from "@/components/CustomLoader";
import { checkAuth } from "@/utils/checkAuth";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import {
  HistoryIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Terminal,
  Rocket,
  ArrowLeft,
  FileText,
  Globe,
} from "lucide-react";
import Footer from "@/components/Footer";

const page = () => {
  const pathName = usePathname();//get current pathname
  const deploymentId = pathName.split("/")[3];//extract deploymentId from URL path
  const [deployment, setDeployment] = useState({});//holds deployment data fetched from backend
  const [isAuthenticated, setIsAuthenticated] = useState(null);//if user authentication is verified
  const router = useRouter();
  const [copiedId, setCopiedId] = useState(false);//when deployment ID is copied
  const [expandedLogs, setExpandedLogs] = useState(true);//controls the logs section
  const logsRef = useRef(null);//for scrolling control

  //authentication check
  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      //if not, redirect to login page
      if (data.status === 400) {
        router.replace("/auth/login");
        return;
      }
    };
    verifyAuth();
    setIsAuthenticated(true); //mark authenticated after successful check
  }, []);

  //fetch deployment details
  useEffect(() => {
    const getDeployment = async () => {
      try {
        //fetch deployment info by deploymentId from backend API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment?deploymentId=${deploymentId}`,
          { credentials: "include" }
        );
        const data = await response.json();
        setDeployment(data); //saves deployment info to state
      } catch (error) {
        console.error(error);
      }
    };
    getDeployment();
  }, []);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logsRef.current && expandedLogs) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [deployment.logs, expandedLogs]);

  //map deployment status to CSS fro styling
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "deployed":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "in-preview":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  //get icon component for each deployment status
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "deployed":
        return <Rocket className="w-4 h-4" />;
      case "in-preview":
        return <Globe className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  //deployment duration in human-readable form
  const formatDuration = () => {
    if (!deployment.endTime) return "In progress...";
    const start = new Date(deployment.startTime);
    const end = new Date(deployment.endTime);
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);

    if (duration < 60) return `${duration}s`;
    if (duration < 3600)
      return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor(
      (duration % 3600) / 60
    )}m`;
  };

  //parse log contents into individual lines, filtering empty lines
  const parseLogContent = (logContent) => {
    // Split by newlines and filter out empty lines
    return logContent.split("\n").filter((line) => line.trim() !== "");
  };

  //determine type of log line based on keywords
  const getLogLineType = (line) => {
    if (line.includes("DONE") || line.includes("BUILD_COMPLETE")) {
      return "success";
    }
    if (line.includes("ERROR") || line.includes("FAILED")) {
      return "error";
    }
    if (line.includes("#") && line.includes("[")) {
      return "step";
    }
    return "info";
  };

  //map log line to CSS text color
  const getLogLineColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "step":
        return "text-blue-400";
      default:
        return "text-gray-300";
    }
  };

  //show loading spinner while verifying auth
  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3] py-6">
        <Navbar />
        <div className="max-w-6xl px-2 mt-[80px] mx-auto">
          {/*header with back button and title*/}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {/*back button navigates to prev page*/}
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-[#2c2f4a]/50 hover:bg-[#2c2f4a]/80 border border-gray-600/30 text-gray-300 hover:text-white transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {/*title*/}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
                  Deployment Logs
                </h1>
              </div>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          </div>

          <div className="space-y-8">
            {/*deployment details panel*/}
            <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
              <div className="flex flex-wrap items-start justify-between mb-6">
                {/*deployment version and status*/}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      Deployment Version {deployment.version}
                    </h2>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(
                        deployment.status
                      )}`}
                    >
                      {getStatusIcon(deployment.status)}
                      {deployment.status?.charAt(0).toUpperCase() +
                        deployment.status?.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="text-right ml-auto py-2">
                  <div className="text-sm text-gray-400 mb-1">Duration</div>
                  <div className="text-lg font-semibold text-white">
                    {formatDuration()}
                  </div>
                </div>
              </div>

              {/*start time, end time and rollback info grid*/}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Start Time */}
                <div className="bg-[#2c2f4a]/50 rounded-2xl p-5 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-green-400" />
                    </div>
                    <span className="font-semibold text-green-300 text-sm uppercase tracking-wide">
                      Started
                    </span>
                  </div>
                  <div className="text-white text-sm">
                    {deployment.startTime
                      ? new Date(deployment.startTime).toLocaleString()
                      : "-"}
                  </div>
                </div>

                {/* End Time */}
                <div className="bg-[#2c2f4a]/50 rounded-2xl p-5 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-semibold text-blue-300 text-sm uppercase tracking-wide">
                      Completed
                    </span>
                  </div>
                  <div className="text-white text-sm">
                    {deployment.endTime
                      ? new Date(deployment.endTime).toLocaleString()
                      : "-"}
                  </div>
                </div>

                {/*rollback availability*/}
                <div className="bg-[#2c2f4a]/50 rounded-2xl p-5 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <HistoryIcon className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="font-semibold text-orange-300 text-sm uppercase tracking-wide">
                      Rollback
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium ${
                      deployment.rollbackAvailable
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}
                  >
                    {deployment.rollbackAvailable ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Available
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Not Available
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Build Logs Section */}
            <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl border border-purple-500/20 backdrop-blur-sm overflow-hidden">
              {/* Logs Header */}
              <div className="bg-gradient-to-r from-[#2c2f4a] to-[#1e1f3a] px-8 py-6 border-b border-gray-600/30">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Terminal className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Build Logs
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {deployment.logs?.length} log entries • Real-time
                        deployment progress
                      </p>
                    </div>
                  </div>

                  {/*button to expand/collapse logs*/}
                  <button
                    onClick={() => setExpandedLogs(!expandedLogs)}
                    className="px-4 ml-auto py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700/80 border border-gray-600/30 text-gray-300 hover:text-white transition-all duration-300 text-sm font-medium"
                  >
                    {expandedLogs ? "Collapse" : "Expand"}
                  </button>
                </div>
              </div>

              {/* Logs Content */}
              {expandedLogs && (
                <div className="p-6">
                  {deployment.logs && deployment.logs.length > 0 ? (
                    <div
                      ref={logsRef}
                      className="bg-[#0f1419] rounded-2xl p-6 max-h-96 overflow-y-auto border border-gray-700/50 scroll-smooth"
                    >
                      <div className="space-y-4">
                        {deployment.logs.map((logEntry, index) => {
                          //split log into lines for better formatting*/
                          const logLines = parseLogContent(logEntry.log);
                          return (
                            <div
                              key={logEntry._id}
                              className="border-l-2 border-gray-600/30 pl-4 hover:border-purple-500/50 transition-colors duration-300"
                            >
                              {/* Log Entry Header */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-500 text-xs font-bold min-w-[3rem]">
                                    {String(index + 1).padStart(3, "0")}
                                  </span>
                                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                  <span className="text-gray-400 text-xs">
                                    {new Date(
                                      logEntry.timestamp
                                    ).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>

                              {/* Log Lines */}
                              <div className="space-y-1 ml-8">
                                {logLines.map((line, lineIndex) => {
                                  const lineType = getLogLineType(line);
                                  const lineColor = getLogLineColor(lineType);

                                  return (
                                    <div
                                      key={lineIndex}
                                      className={`font-mono text-sm ${lineColor} hover:bg-gray-800/30 rounded px-2 py-1 transition-colors duration-200`}
                                    >
                                      {line}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    //show if no logs present
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700/50 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">
                        No logs available
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        Logs will appear here as the deployment progresses
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/*page footer*/}
      <Footer />
    </>
  );
};
export default page;
