"use client";
import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";

const Dashboard = () => {
  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      if (data.status === 400) {
        router.replace("/auth/login");
      }
    };
    verifyAuth();
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
    } catch (error) {
      console.log(error);
      CustomToast("Error while getting your repositories");
    }
  };
  return (
    <div>
      <ToastContainer />
      <button onClick={() => getRepos()}>Get github</button>
    </div>
  );
};

export default Dashboard;
