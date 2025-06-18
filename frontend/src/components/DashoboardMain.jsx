import { useRouter } from "next/navigation";

const DashboardMain = ({ repos, logs, url, repoRef }) => {
  const router = useRouter();
  return (
    <div 
      ref={repoRef}
      className="flex-1 p-8 space-y-8 min-h-screen bg-gradient-to-br from-[#003047] to-[#37005c]"
    >
      <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
        Your GitHub Repositories
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {repos.map((repo, i) => (
          <div
            key={i}
            className="relative group border border-[#7b00cc] rounded-2xl p-6 shadow-xl bg-gradient-to-br from-[#1a0033]/80 via-[#003047]/90 to-[#2d004e]/90 hover:scale-105 hover:shadow-purple-900/70 hover:border-[#ad65dd] transition-all duration-300 cursor-pointer backdrop-blur-md"
            onClick={() => router.push(`/project/create?repo=${repo.name}`)}
          >
            <h3 className="font-bold text-xl text-white mb-2">{repo.name}</h3>
            <p className="text-sm text-gray-400">
              {repo.description || "No description"}
            </p>
          </div>
        ))}
      </div>

      {url && (
        <div className="bg-gradient-to-r from-[#6200a3] via-[#6e00b8] to-[#7b00cc] rounded-lg p-4 mt-6 flex items-center gap-3 shadow-md">
          <span className="text-white font-semibold">App URL:</span>
          <a
            href={url}
            className="underline text-white font-mono break-all"
            target="_blank"
            rel="noopener noreferrer"
          >
            {url}
          </a>
        </div>
      )}
    </div>
  );
};

export default DashboardMain;
