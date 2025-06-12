"use client";
import React, { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";

const Dashboard = () => {
  useEffect(() => {
    const verifyAuth = async () => {
      const response = await checkAuth();
      console.log(response);
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

  const getGithub = async () => {
    try {
      if (localStorage.getItem("hasGithubPermission") === false) {
        getOAuthConsent();
      }
      const response = await fetch(
        "http://localhost:3000/api/v1/github/getUserRepos",
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
  return (
    <div>
      <ToastContainer />
      <button onClick={() => getGithub()}>Get github</button>
    </div>
  );
};

export default Dashboard;
