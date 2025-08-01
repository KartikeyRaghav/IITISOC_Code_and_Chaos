"use client";

import React, { useState } from "react";
import {
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Save,
  X,
  Key,
  Lock,
  Globe,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEnvironmentVariables } from "./hooks/useEnvVar";
import { useRouter } from "next/navigation";

const EnvironmentVariables = () => {
  const [activeEnvironment, setActiveEnvironment] = useState("production");
  const [newVar, setNewVar] = useState({
    key: "",
    value: "",
    isSecret: false,
    environment: "production",
  });
  const [showNewVarForm, setShowNewVarForm] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState(new Set());
  const [editingVar, setEditingVar] = useState(null);
  const router = useRouter();

  const {
    envVars,
    loading,
    error,
    addEnvironmentVariable,
    updateEnvironmentVariable,
    deleteEnvironmentVariable,
    refetch,
  } = useEnvironmentVariables();

  const environments = [
    {
      key: "production",
      label: "Production",
      icon: Globe,
      color: "text-green-400",
    },
    { key: "preview", label: "Preview", icon: Eye, color: "text-purple-400" },
  ];

  const toggleSecretVisibility = (_id) => {
    setVisibleSecrets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(_id)) {
        newSet.delete(_id);
      } else {
        newSet.add(_id);
      }
      return newSet;
    });
  };

  const filteredEnvVars = envVars.filter(
    (envVar) => envVar.environment === activeEnvironment
  );

  const EnvVarForm = ({ envVar, onSave, onCancel }) => {
    const [formData, setFormData] = useState(envVar);

    return (
      <div className="bg-[#2c2f4a]/50 rounded-2xl p-6 border border-gray-600/30 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Variable Name
            </label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, key: e.target.value }))
              }
              placeholder="e.g., DATABASE_URL"
              className="w-full px-4 py-3 bg-[#1a1b2e] border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Environment
            </label>
            <select
              value={formData.environment}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  environment: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-[#1a1b2e] border border-gray-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            >
              {environments.map((env) => (
                <option key={env.key} value={env.key}>
                  {env.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Value
          </label>
          <textarea
            value={formData.value}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, value: e.target.value }))
            }
            placeholder="Enter the variable value..."
            rows={3}
            className="w-full px-4 py-3 bg-[#1a1b2e] border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, isSecret: !prev.isSecret }))
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
              formData.isSecret
                ? "bg-red-500/20 border-red-500/50 text-red-300"
                : "bg-gray-600/20 border-gray-600/50 text-gray-300 hover:border-gray-500"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {formData.isSecret ? "Secret Variable" : "Public Variable"}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.key || !formData.value}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            <Save className="w-4 h-4" />
            Save Variable
          </button>

          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600/50 text-gray-300 rounded-xl font-medium hover:bg-gray-600/70 transition-all duration-300"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="w-full min-h-screen p-10 bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
          <div className="bg-gradient-to-br mt-[80px] max-w-5xl mx-auto from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-8 border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="ml-3 text-gray-300">
                Loading environment variables...
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer /> {/*for toast notifs*/}
      <Navbar />
      <div className="w-full p-10 bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3]">
        <div className="bg-gradient-to-br mt-[80px] mx-auto max-w-5xl from-[#23243a] to-[#1a1b2e] rounded-3xl shadow-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-xl flex items-center justify-center shadow-lg"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <h3 className="text-xl font-bold text-white">
                Environment Variables
              </h3>
            </div>

            <button
              onClick={() => {
                setNewVar({
                  key: "",
                  value: "",
                  isSecret: false,
                  environment: activeEnvironment,
                });
                setShowNewVarForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Add Variable
            </button>
          </div>

          {/* Environment Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 mb-6 p-1 bg-[#2c2f4a]/30 rounded-2xl">
            {environments.map((env) => {
              const Icon = env.icon;
              const isActive = activeEnvironment === env.key;

              return (
                <button
                  key={env.key}
                  onClick={() => setActiveEnvironment(env.key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 flex-1 justify-center ${
                    isActive
                      ? "bg-gradient-to-r from-[#00aaff]/20 to-[#9a00ff]/20 text-white border border-blue-400/30"
                      : "text-gray-400 hover:text-gray-300 hover:bg-[#2c2f4a]/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? env.color : ""}`} />
                  {env.label}
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isActive
                        ? "bg-blue-400/20 text-blue-300"
                        : "bg-gray-600/50 text-gray-400"
                    }`}
                  >
                    {isActive
                      ? filteredEnvVars.length
                      : envVars.length - filteredEnvVars.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* New Variable Form */}
          {showNewVarForm && (
            <div className="mb-6">
              <EnvVarForm
                envVar={newVar}
                onSave={addEnvironmentVariable}
                onCancel={() => setShowNewVarForm(false)}
              />
            </div>
          )}

          {error && <div>{error}</div>}

          {/* Environment Variables List */}
          <div className="space-y-4">
            {filteredEnvVars.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-300 mb-2">
                  No environment variables
                </h4>
                <p className="text-gray-400 mb-4">
                  Add your first environment variable for the{" "}
                  {activeEnvironment} environment
                </p>
                <button
                  onClick={() => {
                    setNewVar({
                      key: "",
                      value: "",
                      isSecret: false,
                      environment: activeEnvironment,
                    });
                    setShowNewVarForm(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00aaff] to-[#9a00ff] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  Add Variable
                </button>
              </div>
            ) : (
              filteredEnvVars.map((envVar) => (
                <div
                  key={envVar._id}
                  className="bg-[#2c2f4a]/50 rounded-2xl p-4 border border-gray-600/20 hover:border-gray-500/30 transition-all duration-300"
                >
                  {editingVar === envVar._id ? (
                    <EnvVarForm
                      envVar={envVar}
                      onSave={updateEnvironmentVariable}
                      onCancel={() => setEditingVar(null)}
                    />
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-blue-300 font-medium">
                            {envVar.key}
                          </span>
                          {envVar.isSecret && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium">
                              <Lock className="w-3 h-3" />
                              Secret
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <code className="bg-[#1a1b2e] px-3 py-2 rounded-lg text-gray-300 font-mono text-sm flex-1 min-w-0">
                            {envVar.isSecret && !visibleSecrets.has(envVar._id)
                              ? "••••••••••••••••"
                              : envVar.value}
                          </code>

                          {envVar.isSecret && (
                            <button
                              onClick={() => toggleSecretVisibility(envVar._id)}
                              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-[#1a1b2e] rounded-lg transition-all duration-300"
                            >
                              {visibleSecrets.has(envVar._id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:ml-4">
                        <button
                          onClick={() => setEditingVar(envVar._id)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-300"
                        >
                          <Key className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteEnvironmentVariable(envVar._id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Info Banner */}
          <div className="mt-6 p-4 hidden sm:block bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">
                  Environment Variable Guidelines
                </p>
                <ul className="space-y-1 text-blue-200/80">
                  <li>
                    • Secret variables are encrypted and hidden by default
                  </li>
                  <li>• Changes take effect after the next deployment</li>
                  <li>• Use UPPERCASE_WITH_UNDERSCORES for variable names</li>
                  <li>
                    • Avoid storing sensitive data in non-secret variables
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EnvironmentVariables;
