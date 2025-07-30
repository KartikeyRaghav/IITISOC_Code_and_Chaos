// This is what will be injected into every deployed frontend
fetch("https://deploy.princecodes.online/api/v1/track", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include",
  body: JSON.stringify({
    projectId: window.__PROJECT_ID__, // injected by NGINX
  }),
});
