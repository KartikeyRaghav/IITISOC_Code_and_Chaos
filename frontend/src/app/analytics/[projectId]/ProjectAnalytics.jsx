"use client";

import CustomToast from "@/components/CustomToast";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
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
    <>
      <ToastContainer/>
      <Navbar/>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 py-8 lg:py-12">
        <div className="w-full max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8">
            User Trends 
          </h2>
          
          {analytics ? (
            <UserLineGraph data={analytics} />
          ) : (
            <p className="text-gray-400">Loading analytics data...</p>
          )}

        </div>
        <Footer/>
      </div>
    </>
  )
};

export default ProjectAnalytics;
