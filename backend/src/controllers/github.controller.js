import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const githubOAuthConsent = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // If user already has GitHub permission, skip consent
  if (user.hasGithubPermission === true) {
    return res.redirect(
      `${process.env.BACKEND_URL}/api/v1/github/getUserRepos`
    );
  }

  // Construct GitHub OAuth URL
  const clientID = process.env.GITHUB_OAUTH_CLIENT_ID;
  const redirectURI = `${process.env.BACKEND_URL}/api/v1/github/callback`;
  const scope = "read:user repo"; // Required scopes

  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scope}`;

  // Redirect to GitHub
  res.redirect(githubAuthURL);
});

export const handleGithubCallback = asyncHandler(async (req, res) => {
  const { code, error } = req.query;

  // Handle if user denied the OAuth request
  if (error === "access_denied") {
    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              status: "error",
              message: "User denied GitHub permission"
            }, ${process.env.FRONTEND_URL});
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  // If no code is returned
  if (!code) {
    return res.status(400).send("Missing code parameter.");
  }

  const clientID = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  // Step 1: Exchange code for token
  const tokenResponse = await fetch(
    `https://github.com/login/oauth/access_token`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        code,
      }),
    }
  );
  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Step 2: Get user info
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });
  const githubUser = await userResponse.json();
  const username = githubUser.login;

  // Step 3: Fetch repos
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const isoDate = sixMonthsAgo.toISOString().split("T")[0];

  const repoResponse = await fetch(
    `https://api.github.com/search/repositories?q=user:${username}+pushed:>${isoDate}&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  const repoData = await repoResponse.json();

  if (!repoData.items || !Array.isArray(repoData.items)) {
    return res.send(`<script>
    window.opener.postMessage({ status: "error", message: "Failed to fetch repos" }, "*");
    window.close();
  </script>`);
  }

  // Step 4: Save everything in DB
  await User.findByIdAndUpdate(req.user._id, {
    githubUsername: username,
    githubAccessToken: accessToken,
    hasGithubPermission: true,
    repos: repoData.items.map((item) => ({
      name: item.name,
      description: item.description,
      html_url: item.html_url,
      clone_url: item.clone_url,
      last_updateAt: new Date(),
    })),
  });

  // Step 5: Send result back to parent window
  return res.send(`<html><body><script>
  window.opener.postMessage({
    status: "success",
    user: {
      username: "${username}"
    }
  }, "${process.env.FRONTEND_URL}");
  window.close();
</script></body></html>`);
});

export const getGithubRepos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+githubAccessToken");
  const username = user.githubUsername;

  // Calculate date 6 months ago in ISO format
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const isoDate = sixMonthsAgo.toISOString().split("T")[0];

  try {
    // Search user’s public repos updated in the last 6 months
    const response = await fetch(
      `https://api.github.com/search/repositories?q=user:${username}+pushed:>${isoDate}&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${user.githubAccessToken}`,
        },
      }
    );

    const data = await response.json();

    // Save the repo details to user model (non-blocking map)

    if (!data.items || !Array.isArray(data.items)) {
      console.error("GitHub API error:", data);
      return res
        .status(500)
        .json({ message: "Failed to fetch repositories", error: data });
    }

    user.repos = data.items.map((item) => ({
      name: item.name,
      description: item.description,
      html_url: item.html_url,
      clone_url: item.clone_url,
      last_updateAt: new Date(),
    }));
    user.hasGithubPermission = true;
    await user.save({ validateBeforeSave: false }); // Save without validation

    res.status(200).json(user.repos); // Return GitHub repo data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching the repos" });
  }
});

export const getRepoBranches = asyncHandler(async (req, res) => {
  const { username, repoName } = req.query;

  const user = await User.findOne({ githubUsername: username }).select(
    "+githubAccessToken"
  );

  if (!username || (!repoName && repoName !== "Select a repo")) {
    return res
      .status(400)
      .json({ message: "Username and Reponame are required" });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/branches`,
      {
        headers: {
          Authorization: `Bearer ${user.githubAccessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error("GitHub API error:", data);
      return res.status(500).json({
        message: "Failed to fetch branches",
        error: data.message || "Unknown error",
      });
    }

    const branch_names = data.map((branch) => branch.name); // Extract branch names

    res.status(200).json({ branch_names });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching the branches" });
  }
});

export const getRepo = asyncHandler(async (req, res) => {
  const { username, repoName } = req.query;

  if (!username || (!repoName && repoName !== "Select a repo")) {
    return res
      .status(400)
      .json({ message: "Username and Reponame are required" });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repoName}`
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching the repo" });
  }
});
