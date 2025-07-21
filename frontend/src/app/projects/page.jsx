"use client";
import CustomToast from "@/components/CustomToast";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import dotenv from "dotenv";
import {
  Plus,
  Calendar,
  FileText,
  ArrowRight,
  Folder,
  Clock,
  Sparkles,
  Rocket,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { checkAuth } from "@/utils/checkAuth";
import CustomLoader from "@/components/CustomLoader";
import Footer from "@/components/Footer";

dotenv.config();

const Project = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [repos, setRepos] = useState([]);
  const router = useRouter();

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
        setRepos(data);
      } catch (error) {
        CustomToast("Error fetching your projects");
      }
    };
    getProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "building":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "deployed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <Sparkles className="w-3 h-3" />;
      case "building":
        return <Clock className="w-3 h-3" />;
      case "deployed":
        return <Rocket className="w-3 h-3" />;
      default:
        return <Folder className="w-3 h-3" />;
    }
  };

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
      <ToastContainer />
      <Navbar />
      <div className="p-6 pt-[104px]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
                    Your Projects
                  </h1>
                </div>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-4"></div>
                <p className="text-gray-300 text-lg">
                  Manage and deploy your applications with ease
                </p>
              </div>

              {/* Create Project Button */}
              <button
                onClick={() => router.push("/projects/create")}
                className="group relative overflow-hidden bg-gradient-to-r from-[#00aaff] via-[#0099ff] to-[#9a00ff] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 hover:scale-105 transform flex items-center gap-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0088cc] to-[#7700cc] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Create Project</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {repos.length === 0 ? (
              <div className="col-span-full">
                <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-16 text-center border border-purple-500/20 backdrop-blur-sm">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#00aaff]/20 to-[#9a00ff]/20 rounded-full mb-8 border border-purple-500/30">
                    <Folder className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Projects Yet
                  </h3>
                  <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Get started by creating your first project. Deploy your
                    repositories with just a few clicks.
                  </p>
                  <button
                    onClick={() => {
                      router.push("/projects/create");
                    }}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 transform"
                  >
                    <Plus className="w-6 h-6" />
                    Create Your First Project
                  </button>
                </div>
              </div>
            ) : (
              repos.map((project, index) => (
                <div
                  key={project.name}
                  onClick={() => router.push(`/projects/${project.name}`)}
                  className="group bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm hover:border-purple-500/40 transition-all duration-500 cursor-pointer hover:scale-[1.02] transform hover:shadow-purple-500/20"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow duration-300">
                          <Folder className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                            {project.name}
                          </h2>
                          {project.status && (
                            <div
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(
                                project.status
                              )}`}
                            >
                              {getStatusIcon(project.status)}
                              {project.status}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                  </div>

                  {/* Project Description */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                      <p className="text-gray-300 leading-relaxed">
                        {project.description || "No description available"}
                      </p>
                    </div>
                  </div>

                  {/* Project Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Calendar className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white font-medium">
                        {project.createdAt
                          ? new Date(project.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>

                    {project.lastActivity && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Clock className="w-3 h-3 text-green-400" />
                        </div>
                        <span className="text-gray-400">Last Activity:</span>
                        <span className="text-white font-medium">
                          {project.lastActivity}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))
            )}
          </div>

          {/* Stats Footer */}
          {repos.length > 0 && (
            <div className="mt-16 bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {repos.length}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Total Projects
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {repos.filter((p) => p.status === "deployed").length}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Deployed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {repos.filter((p) => p.status === "active").length}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Active
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {repos.filter((p) => p.status === "building").length}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Building
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Project;
