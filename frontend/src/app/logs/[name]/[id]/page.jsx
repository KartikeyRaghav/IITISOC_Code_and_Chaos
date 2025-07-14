"use client";

import CustomLoader from "@/components/CustomLoader";
import { checkAuth } from "@/utils/checkAuth";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {Code, HistoryIcon } from "lucide-react";

const page = () => {
  const pathName = usePathname();
  const deploymentId = pathName.split("/")[3];
  const [deployment, setDeployment] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(null);
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
    const getDeployment = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/deployment?deploymentId=${deploymentId}`,
          { credentials: "include" }
        );
        const data = await response.json();
        setDeployment(data);
      } catch (error) {
        console.error(error);
      }
    };
    getDeployment();
  });

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
      <Navbar />
      <div className="p-6 mt-[80px]">
          <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                      <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
                        Deployment Logs
                      </h1>
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
                  </div>
                  <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm mb-8">
                    <div className="flex items-center gap-3 mb-3">
                      <Code className="w-6 h-6 text-blue-400"/>
                      <span className="text-lg font-semibold text-white">Deployment ID:</span>
                      <span className="text-blue-300 font-mono">{deployment._id}</span>
                    </div>
                  </div>

                  <div className="bg-[#2c2f4a]/50 rounded-2xl p-6 border border-gray-600/20 background-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <HistoryIcon className="w-5 h-5 text-purple-400" />
                      Logs 
                    </h3>
                    {deployment.logs && deployment.logs.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto space-y-2 font-mono text-sm text-gray-200">
                        {deployment.logs.map((log) => (
                          <div
                            key={log.id || log._id}
                            className="bg-[#1a1b2e] rounded p-3 border border-gray-700/30"
                          >
                            {log.message}
                          </div>
                        ))}
                      </div> 
                    ):(
                      <p className="text-gray-400">No logs available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
  );
};
export default page;
