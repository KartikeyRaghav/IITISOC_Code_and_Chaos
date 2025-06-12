"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";
import CustomLoader from "@/components/CustomLoader";

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      if (data.status === 400) {
        router.replace("/auth/login");
      }
    };
    verifyAuth();
    setIsAuthenticated(true);
  }, []);

  const getOAuthConsent = () => {
    const oauthWindow = window.open(
      "http://localhost:3000/api/v1/github",
      "_blank",
      "width=600,height=700"
    );
    window.close();
  };

  const getRepos = async () => {
    try {
      if (localStorage.getItem("hasGithubPermission") === "false") {
        getOAuthConsent();
      }
      const response = await fetch(
        "http://localhost:3000/api/v1/github/getGithubRepos",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      // console.log(data.data.items[0]);
    } catch (error) {
      console.log(error);
      CustomToast("Error while getting your repositories");
    }
  };

  const getUserRepos = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/getUserRepos",
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.log(error);
      CustomToast("Error while getting your repositories");
    }
  };

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <div>
      <ToastContainer />
      <button onClick={() => getRepos()}>Get github</button>
      <button onClick={() => getUserRepos()}>Get user repos</button>
    </div>
  );
};

export default Dashboard;
