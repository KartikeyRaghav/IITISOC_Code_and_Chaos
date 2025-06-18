import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const githubOAuthConsent = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user.hasGithubPermission === true) {
    res.redirect(`http://localhost:3001/api/v1/github/getUserRepos`);
  }
  const clientID = process.env.GITHUB_CLIENT_ID;
  const redirectURI = "http://localhost:3001/api/v1/github/callback";
  const scope = "read:user repo";

  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scope}`;

  res.redirect(githubAuthURL);
});

export const handleGithubCallback = asyncHandler(async (req, res) => {
  const { code, error } = req.query;

  if (error === "access_denied") {
    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              status: "error",
              message: "User denied GitHub permission"
            }, "http://localhost:4001");
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.status(400).send("Missing code parameter.");
  }

  const clientID = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

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

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });
  const githubUser = await userResponse.json();
  const username = githubUser.login;

  const user = await User.findByIdAndUpdate(req.user._id, {
    githubUsername: username,
    hasGithubPermission: true,
  });
  res.send(`
  <html>
    <body>
      <script>
        // Send user data to opener window
        window.opener.postMessage({
          status: "success",
          user: {
            username: "${user.login}",
            email: "${user.email}",
            avatar: "${user.avatar_url}"
          }
        }, "http://localhost:4001");

        window.close();
      </script>
    </body>
  </html>
`);
});

export const getGithubRepos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const username = user.githubUsername;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const isoDate = sixMonthsAgo.toISOString().split("T")[0];

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=user:${username}+pushed:>${isoDate}&per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github+json",
        },
      }
    );
    const data = await response.json();
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
    user.save({ validateBeforeSave: false });

    res.json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching the repos" });
  }
});

export const getRepoBranches = asyncHandler(async (req, res) => {
  const { username, repoName } = req.body;
  if (!username || !repoName) {
    return res
      .status(400)
      .json({ message: "Username and Reponame are required" });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${username}/${repoName}/branches`
    );
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching the branches" });
  }
});
