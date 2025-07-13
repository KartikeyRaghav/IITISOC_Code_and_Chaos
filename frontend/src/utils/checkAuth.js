export const checkAuth = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/profile`,
      {
        credentials: "include",
      }
    );
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("githubUsername", data.user.githubUsername);
      localStorage.setItem(
        "hasGithubPermission",
        data.user.hasGithubPermission
      );
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("repos", JSON.stringify(data.user.repos));
      localStorage.setItem("fullName", data.user.fullName);
      localStorage.setItem("count", data.projectCount);
      return { data: data, status: 200 };
    } else {
      return { status: 400, message: "User logged out" };
    }
  } catch (error) {
    console.error(error);
    return { status: 400, message: "User logged out" };
  }
};
