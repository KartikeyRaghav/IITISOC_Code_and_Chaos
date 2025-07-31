"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Eye,
  Calendar,
  TrendingUp,
  ArrowRight,
  Activity,
  Globe,
  Clock,
  MousePointer,
} from "lucide-react";
import CustomLoader from "@/components/CustomLoader";
import CustomToast from "@/components/CustomToast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { checkAuth } from "@/utils/checkAuth";
import { ToastContainer } from "react-toastify";

const AnalyticsDashboard = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      if (data.status === 400) {
        router.replace("/auth/login");
        return;
      }
      setIsAuthenticated(true);
    };
    verifyAuth();
  }, [router]);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setProjects(data.data || []);
      } catch (error) {
        console.error(error);
        CustomToast("Error fetching your projects");
      } finally {
        setIsLoading(false);
      }
    };
    getProjects();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getTotalStats = () => {
    return projects.reduce(
      (acc, project) => ({
        totalVisits: acc.totalVisits + project.totalVisits,
        uniqueVisitors: acc.uniqueVisitors + project.uniqueVisitors,
      }),
      { totalVisits: 0, uniqueVisitors: 0 }
    );
  };

  const totalStats = getTotalStats();

  if (isAuthenticated === null || isLoading) {
    return <CustomLoader text="Loading analytics dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
      <ToastContainer />
      <Navbar />
      <div className="p-6 pt-[104px]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
                    Analytics Dashboard
                  </h1>
                </div>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-4"></div>
                <p className="text-gray-300 text-lg">
                  Monitor your projects' performance and user engagement
                </p>
              </div>
            </div>
          </motion.div>

          {/* Overview Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {projects.length}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Active Projects
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {totalStats.totalVisits}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Total Visits
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {totalStats.uniqueVisitors}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Unique Visitors
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Projects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">
                Project Analytics
              </h2>
            </div>

            {projects.length === 0 ? (
              <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-12 text-center border border-purple-500/20 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white opacity-50" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Analytics Data
                </h3>
                <p className="text-gray-400">
                  Start deploying projects to see analytics data here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.projectId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    onClick={() =>
                      router.push(`/analytics/${project.projectId}`)
                    }
                    className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:shadow-purple-500/20"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Globe className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                            {project.name}
                          </h3>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-[#2c2f4a]/50 rounded-xl p-3 border border-gray-600/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">
                            Visits
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {project.totalVisits}
                        </div>
                      </div>
                      <div className="bg-[#2c2f4a]/50 rounded-xl p-3 border border-gray-600/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">
                            Unique
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {project.uniqueVisitors}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 pt-3 border-t border-gray-600/20">
                      <Clock className="w-4 h-4" />
                      <span>
                        Last visit: {formatDate(project.lastVisitedAt)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400 font-medium">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-purple-400 group-hover:text-purple-300 transition-colors">
                        <MousePointer className="w-3 h-3" />
                        <span>View Details</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnalyticsDashboard;
