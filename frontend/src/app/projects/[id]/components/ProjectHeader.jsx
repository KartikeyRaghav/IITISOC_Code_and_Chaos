import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const ProjectHeader = () => {
  const router = useRouter();
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        {/*back button navigates to prev page*/}
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-[#2c2f4a]/50 hover:bg-[#2c2f4a]/80 border border-gray-600/30 text-gray-300 hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {/*title*/}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-400 to-purple-600 bg-clip-text">
            Project Details
          </h1>
        </div>
      </div>
      <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
    </div>
  );
};

export default ProjectHeader;
