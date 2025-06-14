"use client";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import CustomToast from "@/components/CustomToast";
import { checkAuth } from "@/utils/checkAuth";
import CustomLoader from "@/components/CustomLoader";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [repos, setRepos] = useState([]);
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState(null);
  const [logs, setLogs] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const data = await checkAuth();
      if (data.status === 400) {
        router.replace("/auth/login");
        return;
      }
      setUser(data.data.user);
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
      setRepos(data);
    } catch (error) {
      console.log(error);
      CustomToast("Error while getting your repositories");
    }
  };

  const runDockerContainer = async (repo, imageName) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/build/dockerContainer`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            repoName: repo.name,
            imageName,
            port: 8081,
          }),
        }
      );
      const data = await response.json();
      setUrl(data.url);
    } catch (error) {
      console.log(error);
      CustomToast("Error while running docker container");
    }
  };

  const generateDockerImage = async (repo, clonedPath) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/build/dockerImage`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            repoName: repo.name,
            clonedPath,
          }),
        }
      );
      const data = await response.json();
      runDockerContainer(repo, data.imageName);
    } catch (error) {
      console.log(error);
      CustomToast("Error while building dockerimage");
    }
  };

  const generateDockerfile = async (repo, clonedPath, techStack) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/build/dockerFile`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            clonedPath,
            techStack,
          }),
        }
      );
      const data = await response.json();
      generateDockerImage(repo, clonedPath);
    } catch (error) {
      console.log(error);
      CustomToast("Error while generating dockerfile");
    }
  };

  const detectTechStack = async (repo, clonedPath) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/build/detectTechStack`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            clonedPath,
          }),
        }
      );
      const data = await response.json();
      generateDockerfile(repo, clonedPath, data.stack);
    } catch (error) {
      console.log(error);
      CustomToast("Error while detecting tech stack");
    }
  };

  const cloneRepo = async (repo) => {
    try {
      const controller = new AbortController();

      fetch(`http://localhost:3000/api/v1/build/cloneRepo`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoName: repo.name,
          cloneUrl: repo.clone_url,
        }),
      })
        .then((response) => {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          const readChunk = () => {
            reader.read().then(({ done, value }) => {
              if (done) return;
              const text = decoder.decode(value);
              setLogs((prev) => [...prev, text]);

              const match = text.match(/\[CLONE_COMPLETE\] (.*)/);
              if (match) {
                let fullTargetDir = match[1];
                console.log("Clone complete. Target Dir:", fullTargetDir);
              }

              readChunk();
            });
          };

          readChunk();
        })
        .catch((err) => console.error("Streaming error:", err));

      return () => controller.abort();
    } catch (error) {
      console.log(error);
      CustomToast("Error while cloning");
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
      {repos.map((repo, i) => (
        <div key={i} onClick={() => cloneRepo(repo)}>
          {repo.name}
        </div>
      ))}
      {url && <Link href={url}>{url}</Link>}
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );
};

export default Dashboard;
