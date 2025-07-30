"use client";

import AnalyticsHeader from "@/components/AnalyticsHeader";
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
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
      <ToastContainer/>
      <Navbar/>

      <main className="flex-grow p-6 pt-[104px]">
        
        <div className="mx-auto max-w-6xl">
          
          <AnalyticsHeader/>

          <section className="mt-8">
            {analytics ? (
              <UserLineGraph data={analytics} />
            ):(
              <p className="text-gray-300">Loading analytics data...</p>
            )}
          </section>
        </div>
      </main>
      <Footer/>
    </div>    
  )
};

export default ProjectAnalytics;
