"use client";

import CustomLoader from "@/components/CustomLoader";
import CustomToast from "@/components/CustomToast";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { checkAuth } from "@/utils/checkAuth";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import {
  TrendingUp,
  Users,
  Eye,
  Globe,
  Calendar,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

export const getAnalytics = async (projectId) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/${projectId}/summary`,
      {
        credentials: "include",
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    CustomToast("Error fetching analytics data");
  }
};

const ProjectAnalytics = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");
  const router = useRouter();
  const [analytics, setAnalytics] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    uniqueVisitors: [],
    referers: [],
  });
  const [isFetching, setIsFetching] = useState(true);
  const [period, setPeriod] = useState("daily");

  // Transform data for chart consumption
  const transformData = (data, type) => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((item) => {
      let formattedDate;
      const count = item.count || 0;

      if (type === "daily") {
        const { year, month, day } = item._id;
        formattedDate = `${month}/${day}`;
      } else if (type === "weekly") {
        const { year, week } = item._id;
        formattedDate = `Week ${week}`;
      } else if (type === "monthly") {
        const { year, month } = item._id;
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        formattedDate = monthNames[month - 1];
      }

      return {
        date: formattedDate,
        users: count,
        period: formattedDate,
      };
    });
  };

  const chartData = transformData(analytics[period], period);
  const uniqueVisitorsCount = analytics?.uniqueVisitors?.[0]?.uniqueCount || 0;
  const totalVisits = chartData.reduce((sum, item) => sum + item.users, 0);

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
  }, [router]);

  useEffect(() => {
    const analyticsFetching = async () => {
      try {
        const analytic = await getAnalytics(projectId);
        if (analytic) {
          setAnalytics(analytic.data);
          setProjectName(analytic.projectName);
        }
      } catch (error) {
        console.error(error);
        CustomToast("Error fetching analytics data");
      } finally {
        setIsFetching(false);
      }
    };
    analyticsFetching();
  }, [projectId]);

  if (isAuthenticated === null || isFetching) {
    return <CustomLoader text="Loading analytics dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
      <ToastContainer />
      <Navbar />
      <div className="p-6 pt-[104px]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
                    {projectName} Dashboard
                  </h1>
                </div>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-4"></div>
                <p className="text-gray-300 text-lg">
                  Insights that drive smarter decisions
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {uniqueVisitorsCount}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Unique Visitors
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
                    {totalVisits}
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
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">
                    {analytics?.referers?.length || 0}
                  </div>
                  <div className="text-gray-400 text-sm uppercase tracking-wide">
                    Traffic Sources
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Section */}
          <section className="mb-8">
            <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8 flex-col gap-4 sm:flex-row sm:gap-0">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Visitor Trends
                  </h2>
                </div>

                <div className="flex flex-col w-full gap-3 sm:flex-row sm:w-auto sm:gap-3 sm:justify-end">
                  {["daily", "weekly", "monthly"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 w-full sm:w-auto ${
                        period === p
                          ? "bg-gradient-to-r from-blue-400 via-purple-500 to-purple-700 shadow-lg text-white transform scale-105"
                          : "bg-gray-800/50 hover:bg-purple-700/50 hover:text-white text-gray-300 border border-gray-600/30"
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorUsers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#d1d5db", fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: "#4b5563" }}
                      padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#d1d5db", fontSize: 12 }}
                      tickLine={false}
                      axisLine={{ stroke: "#4b5563" }}
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(31, 41, 55, 0.95)",
                        borderRadius: "12px",
                        border: "1px solid #8b5cf6",
                        color: "white",
                        fontWeight: "600",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                      }}
                      labelStyle={{ color: "#a78bfa", fontWeight: "bold" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="url(#colorUsers)"
                      dot={{
                        r: 6,
                        stroke: "#8b5cf6",
                        strokeWidth: 2,
                        fill: "#c4b5fd",
                      }}
                      activeDot={{
                        r: 8,
                        stroke: "#8b5cf6",
                        strokeWidth: 2,
                        fill: "#ffffff",
                        boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    No data available for {period} view
                  </p>
                  <p className="text-sm">
                    Data will appear here once visitors start using your
                    application
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Referrers Section */}
          {analytics?.referers && analytics.referers.length > 0 && (
            <section>
              <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Traffic Sources
                  </h2>
                </div>

                <div className="space-y-4">
                  {analytics.referers.map((referer, index) => (
                    <div
                      key={index}
                      className="bg-[#2c2f4a]/50 rounded-xl p-4 border border-gray-600/20 hover:border-purple-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                          <span className="text-white font-medium truncate">
                            {referer._id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-green-400">
                            {referer.count}
                          </span>
                          <span className="text-gray-400 text-sm">visits</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectAnalytics;
