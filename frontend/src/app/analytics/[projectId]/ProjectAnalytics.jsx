"use client";

import AnalyticsHeader from "@/components/AnalyticsHeader";
import CustomToast from "@/components/CustomToast";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import UniqueVisitorsCard from "@/components/UniqueVisitorsCard";
import UserLineGraph from "@/components/UserLineGraph";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";

const ProjectAnalytics = () => {
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const getAnalytics = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/analytics/${projectId}/summary`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        console.log(data);
        setAnalytics(data);
      } catch (error) {
        console.error(error);
        CustomToast("Error fetching your projects");
      }
    };
    getAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
      <ToastContainer/>
      <Navbar/>
      <div className="p-6 pt-[104px]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
                    User Trends
                  </h1>
                </div>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-4"></div>
                <p className="text-gray-300 text-lg">
                  Insights that drive smarter decisions
                </p>
                </div>
                </div>
                </div>
          <section className="mt-8">
            {analytics ? (
              <>
                <UserLineGraph data={analytics} />
                <UniqueVisitorsCard count= {analytics.uniqueVisitors} />
              </>
            ):(
              <p className="text-gray-300">Loading analytics data...</p>
            )}
          </section>
        </div>
      </div>
      <Footer/>
     </div>
  )
};

export default ProjectAnalytics;
