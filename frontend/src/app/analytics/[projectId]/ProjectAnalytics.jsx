"use client";

import CustomToast from "@/components/CustomToast";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

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

  return <div>ProjectAnalytics</div>;
};

export default ProjectAnalytics;
