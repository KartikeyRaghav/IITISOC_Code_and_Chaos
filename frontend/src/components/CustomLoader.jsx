"use client";

import React from "react";
import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";
import { Code2 } from "lucide-react";

const CustomLoader = ({ text }) => {
  const loaderText = text || "Loading your dashboard...";

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#004466] via-[#1a365d] to-[#6a00b3] relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main loader content */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Logo/Icon container */}
        <motion.div
          className="mb-8 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#00aaff] to-[#9a00ff] rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 border border-white/10 backdrop-blur-sm">
            <Code2 className="w-10 h-10 text-white" />
          </div>

          {/* Rotating ring */}
          <motion.div
            className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 rounded-2xl"
            style={{
              background:
                "linear-gradient(45deg, transparent, transparent), linear-gradient(45deg, #00aaff, #9a00ff, #00aaff)",
              backgroundClip: "padding-box, border-box",
              backgroundOrigin: "padding-box, border-box",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Spinner */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <SyncLoader
            color="#ffffff"
            size={12}
            margin={4}
            speedMultiplier={0.8}
          />
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text">
            {loaderText}
          </h2>
          <p className="text-gray-300 text-sm">
            Please wait while we prepare everything for you
          </p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.6, duration: 2, repeat: Infinity }}
          className="mt-6 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
          style={{ width: "200px" }}
        >
          <motion.div
            className="h-full bg-white/30 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "50%" }}
          />
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default CustomLoader;
