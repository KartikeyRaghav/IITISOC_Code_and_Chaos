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
  const [isAuthenticated, setIsAuthenticated] = useState(null);//to indicate if user is authenticated
  const [repos, setRepos] = useState([]);//stores user's repos
  const [url, setUrl] = useState(null);//to pass a repo URL somewhere
  const router = useRouter();//for navigation
  const [hasGithubPermission, setHasGithubPermission] = useState(false);//to check if user granted GitHub access
  const [githubInstallationId, setGithubInstallationId] = useState(null);//GitHub app installation ID (if any)

  const repoRef = useRef(null);//reference to the repo list (for scroll-into-view)

  //authentication check
  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      //if not authenticated, redirects to login page
      if (data.status === 400) {
        router.replace("/auth/login");
        return;
      }
    };
    verifyAuth();
    setIsAuthenticated(true);//proceed after initial auth check
  }, []);

  //load GitHub permission & installationId from localStorage
  useEffect(() => {
    if (localStorage.getItem("hasGithubPermission") === "true") {
      setHasGithubPermission(true);
    }

    if (localStorage.getItem("githubInstallationId") !== null) {
      setGithubInstallationId(localStorage.getItem("githubInstallationId"));
    }
  }, []);

  //GitHub OAuth consent flow
  //initiates the GitHub OAuth consent popups, listens for response
  const getOAuthConsent = () => {
    const oauthWindow = window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/github`,
      "_blank",
      "width=600,height=700"
    );

    //listen for msgs from popup window
    const receiveMessage = async (event) => {
      //ensure msg is from frontend
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

  //fetch user's GitHub repos
  //triggers backend fetch & then fetch user's saves repos from DB
  const getGithub = async () => {
    try {
      if (localStorage.getItem("hasGithubPermission") === "false") {
        await getOAuthConsent();
      }
      //asks backend to fetch user GitHub repos using token
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

  //fetch user's repos from your DB
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

      //scroll to repo list after data is set
      setTimeout(() => {
        repoRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); //slight delay to ensure rendering is complete
    } catch (error) {
      console.error(error);
      CustomToast("Error while getting your repositories");
    }
  };

  //fetch fresh GitHub repos
  const getGithubRepos = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/github/getGithubRepos`,
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

  //handle GitHub app installation redirect
  const handleInstall = async () => {
    window.location.href = `https://github.com/apps/ignitia-github/installations/new`;
  };

  //loading spinner while auth status is pending
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
            githubInstallationId={githubInstallationId}
            onGetGithubRepos={getGithubRepos}
            handleInstall={handleInstall}
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
