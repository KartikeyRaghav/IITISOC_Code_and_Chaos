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
      <div className="lg:min-h-screen w-full flex flex-col lg:flex-row bg-gray-900">
        <div className="w-full lg:w-3/4 mx-auto mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            User Trends 
          </h2>
          {analytics && (
            <UserLineGraph data={analytics} />
          )}
        </div>
        <Footer/>
      </div>
    </>
  )
};

export default ProjectAnalytics;
