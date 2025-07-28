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
import Footer from "@/components/Footer";

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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/github`,
      "_blank",
      "width=600,height=700"
    );

    const receiveMessage = async (event) => {
      if (event.origin !== process.env.NEXT_PUBLIC_FRONTEND_URL) return;

      const { status } = event.data;

      if (status === "success") {
        localStorage.setItem("hasGithubPermission", "true");
        setHasGithubPermission(true);

        await getGithub(); // ← fetch repos after access token is saved
      } else {
        CustomToast("GitHub access denied.");
      }

      window.removeEventListener("message", receiveMessage);
    };

    window.addEventListener("message", receiveMessage);
  };

  const getGithub = async () => {
    try {
      if (localStorage.getItem("hasGithubPermission") === "false") {
        await getOAuthConsent();
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/github/getGithubRepos`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      await getUserRepos(); // Fetch from DB and render
    } catch (error) {
      console.error(error);
      CustomToast("Error while getting your repositories");
    }
  };

  const getUserRepos = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/getUserRepos`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      setRepos(data);

      setTimeout(() => {
        repoRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); //slight delay to ensure rendering is complete
    } catch (error) {
      console.error(error);
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
      <div className="lg:min-h-screen w-full flex flex-col lg:flex-row bg-gray-900">
        <div className="w-full mt-[80px] lg:mt-0 lg:w-3/4">
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
      <Footer />
    </>
  );
};

export default Dashboard;
