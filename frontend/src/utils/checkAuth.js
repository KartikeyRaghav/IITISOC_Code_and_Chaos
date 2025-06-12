export const checkAuth = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/v1/users/profile", {
      credentials: "include",
    });
    const data = await response.json();

    localStorage.setItem("githubUsername", data.user.githubUsername);
    localStorage.setItem("hasGithubPermission", data.user.hasGithubPermission);
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("repos", data.user.repos);
    localStorage.setItem("fullName", data.user.fullName);

    if (response.ok) {
      return data;
    } else {
      return { message: "User logged out" };
    }
  } catch (error) {
    console.log("Error");
    return { message: "User logged out" };
  }
};
