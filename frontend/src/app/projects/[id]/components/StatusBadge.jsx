import React from "react";
import {
  CheckCircle,
  AlertCircle,
  Package,
  Activity,
  Clock,
} from "lucide-react";

const StatusBadge = ({ status, size = "md" }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "in-preview":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
      case "deployed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    const iconClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";

    switch (status) {
      case "completed":
      case "deployed":
        return <CheckCircle className={iconClass} />;
      case "in-preview":
        return <Activity className={`${iconClass} animate-pulse`} />;
      case "failed":
        return <AlertCircle className={iconClass} />;
      case "cancelled":
        return <Clock className={iconClass} />;
      default:
        return <Package className={iconClass} />;
    }
  };

  const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1 text-sm";

  return (
    <div
      className={`inline-flex items-center gap-2 ${sizeClasses} rounded-lg font-medium border ${getStatusColor(
        status
      )}`}
    >
      {getStatusIcon(status)}
      {status}
    </div>
  );
};

export default StatusBadge;
