import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  CheckCircle,
  Package,
  ChevronDown,
  ChevronRight,
  Activity,
  Zap,
  FileText,
  Container,
  Globe,
  ExternalLink,
  Rocket,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { LogParser } from "@/utils/logParser";

const EnhancedLogDisplay = ({ logs = [], isBuilding = false }) => {
  const [events, setEvents] = useState([]);
  const [expandedSections, setExpandedSections] = useState(new Set(["major"]));
  const [overallProgress, setOverallProgress] = useState(0);
  const [deploymentUrl, setDeploymentUrl] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const detailedLogsRef = useRef(null);

  const errorCount = events.filter((e) => e.type === "error").length;

  useEffect(() => {
    const parsedEvents = LogParser.parseLogs(logs);
    setEvents(parsedEvents);
    setOverallProgress(LogParser.getOverallProgress(parsedEvents));
    setDeploymentUrl(LogParser.getDeploymentUrl(parsedEvents));
    const hasError = LogParser.hasErrors(parsedEvents);
    setIsComplete(!hasError && LogParser.isDeploymentComplete(parsedEvents));
    // setIsComplete(LogParser.isDeploymentComplete(parsedEvents));
  }, [logs]);

  useEffect(() => {
    if (detailedLogsRef.current && expandedSections.has("detailed")) {
      detailedLogsRef.current.scrollTop = detailedLogsRef.current.scrollHeight;
    }
  }, [events, expandedSections]);

  useEffect(() => {
    if (isComplete && deploymentUrl && detailedLogsRef.current) {
      detailedLogsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isComplete]);

  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const copyUrl = async () => {
    if (deploymentUrl) {
      try {
        await navigator.clipboard.writeText(deploymentUrl);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy URL:", err);
      }
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "dockerfile":
        return <FileText className="w-4 h-4" />;
      case "build":
        return <Package className="w-4 h-4" />;
      case "container":
        return <Container className="w-4 h-4" />;
      case "nginx":
        return <Globe className="w-4 h-4" />;
      case "deployment":
        return <Rocket className="w-4 h-4" />;
      default:
        return <Terminal className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "major":
        return "text-blue-400 bg-blue-500/20 border-blue-500/30";
      case "success":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "completion":
        return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
      case "warning":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "error":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const majorEvents = events.filter(
    (e) => e.type === "major" || e.type === "success" || e.type === "completion"
  );
  const minorEvents = events.filter(
    (e) => e.type === "info" || e.type === "minor"
  );

  return (
    <div className="bg-gradient-to-br from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl border border-purple-500/20 backdrop-blur-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#2c2f4a] to-[#1e1f3a] px-8 py-6 border-b border-gray-600/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Build Logs</h4>
              <p className="text-gray-400 text-sm">
                Real-time deployment progress
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {overallProgress}% Complete
              </div>
              <div className="text-xs text-gray-400">
                {isComplete
                  ? "Deployed Successfully"
                  : isBuilding
                  ? "Building..."
                  : "Ready"}
              </div>
            </div>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  isComplete
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-blue-500 to-green-500"
                }`}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {deploymentUrl && (
        <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-b border-emerald-500/30 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                <Rocket className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h5 className="text-emerald-300 font-semibold text-sm">
                  🎉 Deployment Successful!
                </h5>
                <p className="text-emerald-400/80 text-xs">
                  Your application is now live
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#1a1b2e]/50 rounded-xl px-4 py-2 border border-emerald-500/20">
                <code className="text-emerald-300 text-sm font-mono">
                  {deploymentUrl}
                </code>
              </div>
              <button
                onClick={copyUrl}
                className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors"
                title="Copy URL"
              >
                {urlCopied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              <a
                href={deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors shadow-lg hover:shadow-emerald-500/25"
              >
                <ExternalLink className="w-4 h-4" />
                Open App
              </a>
            </div>
          </div>
        </div>
      )}
      {errorCount > 0 && (
        <div className="px-8 py-4 bg-red-600/10 border-b border-red-500/20 text-red-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>
            {errorCount} error{errorCount > 1 ? "s" : ""} found during
            deployment
          </span>
        </div>
      )}
      <div className="p-6">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700/50 rounded-full mb-4">
              {isBuilding ? (
                <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
              ) : (
                <Terminal className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <p className="text-gray-400 text-lg font-medium">
              {isBuilding ? "Initializing build process..." : "No logs yet"}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {isBuilding
                ? "Please wait while we prepare your deployment"
                : "Start a build to see progress here"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <button
                onClick={() => toggleSection("major")}
                className="flex items-center gap-3 w-full text-left mb-4 hover:bg-gray-800/30 rounded-lg p-2 -m-2 transition-colors"
              >
                {expandedSections.has("major") ? (
                  <ChevronDown className="w-5 h-5 text-purple-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-purple-400" />
                )}
                <Zap className="w-5 h-5 text-purple-400" />
                <h5 className="text-lg font-semibold text-white">
                  Major Milestones ({majorEvents.length})
                </h5>
                {isComplete && (
                  <div className="ml-auto flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Complete
                  </div>
                )}
              </button>
              {LogParser.hasErrors(events) && (
                <div className="bg-red-600/20 text-red-300 border border-red-500/30 rounded-xl px-4 py-3 text-sm font-medium shadow">
                  🚨 Deployment encountered critical errors. Check the logs
                  above for details.
                </div>
              )}
              {expandedSections.has("major") && (
                <div className="space-y-3 ml-8">
                  {majorEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${getTypeColor(
                        event.type
                      )}`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {event.type === "success" ||
                        event.type === "completion" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          getCategoryIcon(event.category)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h6 className="font-semibold text-sm">
                            {event.title}
                          </h6>
                          {event.progress && (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/20">
                              {event.progress}%
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs opacity-80 mb-2">
                            {event.description}
                          </p>
                        )}
                        {event.url && (
                          <div className="mt-2">
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
                            >
                              <Globe className="w-3 h-3" />
                              {event.url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                        {event.details &&
                          event.details.length > 0 &&
                          !event.url && (
                            <div className="font-mono text-xs opacity-60 bg-black/20 rounded p-2">
                              {event.details[0]}
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {minorEvents.length > 0 && (
              <div>
                <button
                  onClick={() => toggleSection("detailed")}
                  className="flex items-center gap-3 w-full text-left mb-4 hover:bg-gray-800/30 rounded-lg p-2 -m-2 transition-colors"
                >
                  {expandedSections.has("detailed") ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <Terminal className="w-5 h-5 text-gray-400" />
                  <h5 className="text-lg font-semibold text-white">
                    Detailed Logs ({minorEvents.length})
                  </h5>
                  <div className="ml-auto text-xs text-gray-500">
                    Auto-scrolling enabled
                  </div>
                </button>

                {expandedSections.has("detailed") && (
                  <div
                    ref={detailedLogsRef}
                    className="bg-[#0f1419] rounded-2xl p-4 max-h-80 overflow-y-auto border border-gray-700/50 ml-8 scroll-smooth"
                  >
                    <div className="space-y-2">
                      {minorEvents.map((event, index) => (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 py-2 hover:bg-gray-800/30 rounded px-2 -mx-2 transition-colors duration-200"
                        >
                          <span className="text-gray-500 text-xs mt-0.5 font-bold min-w-[3rem]">
                            {String(index + 1).padStart(3, "0")}
                          </span>
                          <div className="flex-shrink-0 mt-0.5">
                            {getCategoryIcon(event.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-300 mb-1">
                              {event.title}
                            </div>
                            {event.details && event.details.length > 0 && (
                              <div className="font-mono text-xs text-green-300 opacity-80">
                                {event.details[0]}
                              </div>
                            )}
                            {event.progress && event.progress > 0 && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                  <span>Progress</span>
                                  <span>{event.progress}%</span>
                                </div>
                                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                                    style={{ width: `${event.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isBuilding && !isComplete && (
              <div className="flex items-center justify-center gap-3 py-4 px-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                <span className="text-blue-300 font-medium">
                  Build in progress...
                </span>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedLogDisplay;
