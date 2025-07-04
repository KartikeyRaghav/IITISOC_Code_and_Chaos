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
  const clientID = process.env.GITHUB_CLIENT_ID;
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

  const clientID = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // Exchange the authorization code for an access token
  const tokenResponse = await fetch(
    `https://github.com/login/oauth/access_token`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new URLSearchParams({
        client_id: clientID,
        client_secret: clientSecret,
        code: code,
      }),
    }
  );

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  // Fetch GitHub user info
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  const githubUser = await userResponse.json();
  const username = githubUser.login;

  // Update user with GitHub data
  const user = await User.findByIdAndUpdate(req.user._id, {
    githubUsername: username,
    hasGithubPermission: true,
  });

  // Send data back to frontend via window.postMessage
  res.send(`
  <html>
    <body>
      <script>
        window.opener.postMessage({
          status: "success",
          user: {
            username: "${user.login}",
            email: "${user.email}",
            avatar: "${user.avatar_url}"
          }
        }, ${process.env.FRONTEND_URL});
        window.close();
      </script>
    </body>
  </html>
`);
});

export const getGithubRepos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
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
        },
      }
    );

    const data = await response.json();

    // Save the repo details to user model (non-blocking map)
    user.repos = [];
    data.items.map(async (item) => {
      user.repos = [
        ...user.repos,
        {
          name: item.name,
          description: item.description,
          html_url: item.html_url,
          clone_url: item.clone_url,
          last_updateAt: new Date(),
        },
      ];
    });

    user.save({ validateBeforeSave: false }); // Save without validation

    res.json({ data }); // Return GitHub repo data
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching the repos" });
  }
});

export const getRepoBranches = asyncHandler(async (req, res) => {
  const { username, repoName } = req.query;

  if (!username || (!repoName && repoName !== "Select a repo")) {
    return res
      .status(400)
      .json({ message: "Username and Reponame are required" });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/branches`
    );

    const data = await response.json();
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
    res.status(200).json(data); // Return complete repo details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching the repo" });
  }
});
