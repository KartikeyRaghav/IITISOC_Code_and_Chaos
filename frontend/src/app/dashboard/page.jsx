"use client";
import React, { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";
import CustomLoader from "@/components/CustomLoader";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ActionPanel from "@/components/ActionPanel";
import DashboardMain from "@/components/DashboardMain";
import AppIntro from "@/components/AppIntro";
import dotenv from "dotenv";

dotenv.config();

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [repos, setRepos] = useState([]);
  const [url, setUrl] = useState(null);
  const router = useRouter();
  const [hasGithubPermission, setHasGithubPermission] = useState(false);

  const repoRef = useRef(null);

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
    if (localStorage.getItem("hasGithubPermission") === "true") {
      setHasGithubPermission(true);
    }
  }, []);

  const getOAuthConsent = () => {
    const oauthWindow = window.open(
      `/api/v1/github`,
      "_blank",
      "width=600,height=700"
    );
    window.close();
  };

  const getGithub = async () => {
    try {
      if (localStorage.getItem("hasGithubPermission") === "false") {
        getOAuthConsent();
      }
      const response = await fetch(`/api/v1/github/getGithubRepos`, {
        credentials: "include",
      });
      const data = await response.json();
      // console.log(data.data.items[0]);
    } catch (error) {
      console.log(error);
      CustomToast("Error while getting your repositories");
    }
  };

  const getUserRepos = async () => {
    try {
      const response = await fetch(`/api/v1/users/getUserRepos`, {
        credentials: "include",
      });
      const data = await response.json();
      setRepos(data);

      setTimeout(() => {
        repoRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); //slight delay to ensure rendering is complete
    } catch (error) {
      console.log(error);
      CustomToast("Error while getting your repositories");
    }
  };

  if (isAuthenticated === null) {
    return <CustomLoader />;
  }

  return (
    <>
      <ToastContainer />
      <Navbar />
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-black">
        <div className="w-full lg:w-3/4">
          <AppIntro />
        </div>
        <div className="w-full lg:w-1/4">
          <ActionPanel
            onGetRepos={getGithub}
            hasGithubPermission={hasGithubPermission}
            onGetUserRepos={getUserRepos}
          />
        </div>
      </div>
      <main className="w-full">
        <DashboardMain repos={repos} url={url} repoRef={repoRef} />
      </main>
    </>
  );
};

export default Dashboard;
