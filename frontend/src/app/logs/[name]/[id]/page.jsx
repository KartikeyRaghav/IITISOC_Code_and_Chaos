"use client";

import CustomLoader from "@/components/CustomLoader";
import { checkAuth } from "@/utils/checkAuth";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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
    <div>
      <h2>Deployment ID: {deployment._id}</h2>
      <h3>Logs:</h3>
      {deployment.logs && deployment.logs.length > 0 ? (
        <ul>
          {deployment.logs.map((log) => (
            <li key={log.id || log._id}>
              {log.message}
            </li>
          ))}
        </ul>
      ):(
        <p>No logs available.</p>
      )}
    </div>
  )
  ;
};

export default page;
