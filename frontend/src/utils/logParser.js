export class LogParser {
  static eventPatterns = [
    {
      pattern: /Generating dockerfile/i,
      type: "major",
      category: "dockerfile",
      title: "Dockerfile Generation",
      description: "Creating Docker configuration",
    },
    {
      pattern: /Dockerfile generated/i,
      type: "success",
      category: "dockerfile",
      title: "Dockerfile Created",
      description: "Docker configuration ready",
    },
    {
      pattern: /Starting docker image build/i,
      type: "major",
      category: "build",
      title: "Image Build Started",
      description: "Building Docker image from configuration",
    },
    {
      pattern: /#0 building with "default" instance/i,
      type: "info",
      category: "build",
      title: "Build Environment",
      description: "Initializing Docker build context",
    },
    {
      pattern: /#1 \[internal\] load build definition/i,
      type: "info",
      category: "build",
      title: "Loading Dockerfile",
      description: "Reading build instructions",
    },
    {
      pattern: /#2 \[internal\] load metadata/i,
      type: "info",
      category: "build",
      title: "Fetching Base Image",
      description: "Downloading nginx:alpine metadata",
    },
    {
      pattern: /#5 \[1\/2\] FROM docker\.io\/library\/nginx:alpine/i,
      type: "major",
      category: "build",
      title: "Base Image Download",
      description: "Pulling nginx:alpine from Docker Hub",
    },
    {
      pattern: /#6 \[2\/2\] COPY \. \/usr\/share\/nginx\/html/i,
      type: "info",
      category: "build",
      title: "Copying Application Files",
      description: "Adding project files to container",
    },
    {
      pattern: /#7 exporting to image/i,
      type: "info",
      category: "build",
      title: "Finalizing Image",
      description: "Creating final Docker image",
    },
    {
      pattern: /Docker image build exited with code 0/i,
      type: "success",
      category: "build",
      title: "Build Completed",
      description: "Docker image created successfully",
    },
    {
      pattern: /\[BUILD_COMPLETE\]/i,
      type: "success",
      category: "build",
      title: "Build Process Finished",
      description: "Image ready for deployment",
    },
    {
      pattern: /Starting docker container run/i,
      type: "major",
      category: "container",
      title: "Container Startup",
      description: "Launching application container",
    },
    {
      pattern: /\/docker-entrypoint\.sh:/i,
      type: "info",
      category: "container",
      title: "Container Initialization",
      description: "Running startup scripts",
    },
    {
      pattern: /Configuration complete; ready for start up/i,
      type: "success",
      category: "nginx",
      title: "Server Configuration Ready",
      description: "Nginx configured and ready to serve",
    },
    {
      pattern: /nginx\/[\d.]+/i,
      type: "info",
      category: "nginx",
      title: "Web Server Started",
      description: "Nginx web server is running",
    },
    {
      pattern: /start worker process/i,
      type: "info",
      category: "nginx",
      title: "Worker Processes",
      description: "Starting nginx worker processes",
    },
    {
      pattern: /Docker container run exited with code 137/i,
      type: "completion",
      category: "deployment",
      title: "Deployment Completed",
      description: "Application successfully deployed and running",
    },
    {
      pattern: /\[RUN_COMPLETE\]/i,
      type: "completion",
      category: "deployment",
      title: "Application Live",
      description: "Your application is now accessible",
    },
  ];

  static parseLog(logLine, index) {
    const trimmedLog = logLine.trim();
    if (!trimmedLog) return null;

    // Extract line number if present
    const lineNumberMatch = trimmedLog.match(/^(\d{3})\s*(.*)/);
    // const lineNumber = lineNumberMatch ? lineNumberMatch[1] :(index + 1).padStart(3, '0');
    const content = lineNumberMatch ? lineNumberMatch[2] : trimmedLog;

    // Check for completion with URL
    const completionUrlMatch = content.match(
      /\[RUN_COMPLETE\]\s+(https?:\/\/[^\s]+)/i
    );
    if (completionUrlMatch) {
      return {
        id: `completion-${index}`,
        timestamp: new Date().toISOString(),
        type: "completion",
        category: "deployment",
        title: "Application Live",
        description: "Your application is now accessible",
        details: [content],
        progress: 100,
        url: completionUrlMatch[1],
      };
    }

    // Check for container exit with code 137
    if (content.includes("Docker container run exited with code 137")) {
      return {
        id: `container-exit-${index}`,
        timestamp: new Date().toISOString(),
        type: "completion",
        category: "deployment",
        title: "Deployment Completed",
        description: "Container started successfully",
        details: [content],
        progress: 99,
      };
    }

    // Find matching pattern
    for (const pattern of this.eventPatterns) {
      if (pattern.pattern.test(content)) {
        return {
          id: `event-${index}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: pattern.type,
          category: pattern.category,
          title: pattern.title,
          description: pattern.description,
          details: [content],
          progress: this.calculateProgress(pattern.category, pattern.title),
        };
      }
    }

    // Handle download progress
    if (content.includes("MB") && content.includes("/")) {
      const progressMatch = content.match(/([\d.]+)MB \/ ([\d.]+)MB/);
      if (progressMatch) {
        const current = parseFloat(progressMatch[1]);
        const total = parseFloat(progressMatch[2]);
        const percentage = Math.round((current / total) * 100);

        return {
          id: `progress-${index}`,
          timestamp: new Date().toISOString(),
          type: "info",
          category: "build",
          title: "Download Progress",
          description: `Downloading base image components`,
          details: [content],
          progress: percentage,
        };
      }
    }

    // Handle extracting operations
    if (content.includes("extracting")) {
      return {
        id: `extract-${index}`,
        timestamp: new Date().toISOString(),
        type: "info",
        category: "build",
        title: "Extracting Layers",
        description: "Unpacking image layers",
        details: [content],
      };
    }

    // Default log entry
    return {
      id: `log-${index}`,
      timestamp: new Date().toISOString(),
      type: "info",
      category: "system",
      title: "System Log",
      description:
        content.length > 50 ? content.substring(0, 50) + "..." : content,
      details: [content],
    };
  }

  static calculateProgress(category, title) {
    const progressMap = {
      "Dockerfile Generation": 5,
      "Dockerfile Created": 10,
      "Image Build Started": 15,
      "Build Environment": 20,
      "Loading Dockerfile": 25,
      "Fetching Base Image": 30,
      "Base Image Download": 50,
      "Copying Application Files": 70,
      "Finalizing Image": 85,
      "Build Completed": 90,
      "Build Process Finished": 95,
      "Container Startup": 98,
      "Server Configuration Ready": 99,
      "Deployment Completed": 99,
      "Application Live": 100,
    };

    return progressMap[title] || 0;
  }

  static parseLogs(logs) {
    const events = [];
    const processedTitles = new Set();

    logs.forEach((log, index) => {
      const event = this.parseLog(log, index);
      if (event) {
        // Avoid duplicate major events
        if (
          event.type === "major" ||
          event.type === "success" ||
          event.type === "completion"
        ) {
          if (!processedTitles.has(event.title)) {
            processedTitles.add(event.title);
            events.push(event);
          }
        } else {
          events.push(event);
        }
      }
    });

    return events;
  }

  static getMajorMilestones(events) {
    return events.filter(
      (event) =>
        event.type === "major" ||
        event.type === "success" ||
        event.type === "completion" ||
        (event.type === "success" &&
          ["dockerfile", "build", "container", "deployment"].includes(
            event.category
          ))
    );
  }

  static getOverallProgress(events) {
    const milestones = this.getMajorMilestones(events);
    if (milestones.length === 0) return 0;

    const maxProgress = Math.max(...milestones.map((m) => m.progress || 0));
    return maxProgress;
  }

  static getDeploymentUrl(events) {
    const completionEvent = events.find(
      (event) => event.type === "completion" && event.url
    );
    return completionEvent?.url || null;
  }

  static isDeploymentComplete(events) {
    return events.some(
      (event) => event.type === "completion" && event.category === "deployment"
    );
  }
}
