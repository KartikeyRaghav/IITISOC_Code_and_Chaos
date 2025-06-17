const DashboardMain = ({ repos, logs, url, onClone }) => {
    return (
        <div className="flex-1 p-8 space-y-8 min-h-screen bg-gradient-to-br from-[#003047] to-[#37005c] to-black">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
                Your GitHub Repositories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {repos.map((repo, i) => (
                    <div
                        key={i}
                        className="relative group border border-[#7b00cc] rounded-2xl p-6 shadow-xl bg-gradient-to-br from-[#1a0033]/80 via-[#003047]/90 to-[#2d004e]/90 hover:scale-105 hover:shadow-purple-900/70 hover:border-[#ad65dd] transition-all duration-300 cursor-pointer backdrop-blur-md"
                        onClick={() => onClone(repo)}
                    >
                        <h3 className="font-bold text-xl text-white mb-2">
                            {repo.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {repo.description || "No description"}
                        </p>
                    </div>
                ))}
            </div>

        {url && (
            <div className="bg-gradient-to-r from-[#6200a3] via-[#6e00b8] to-[#7b00cc] rounded-lg p-4 mt-6 flex items-center gap-3 shadow-md">
                <span className="text-white font-semibold">
                    App URL: 
                </span>
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

        <div className="mt-8 bg-black/90 border border-[#ad65dd] text-green-200 p-6 rounded-xl h-60 overflow-y-scroll font-mono text-sm shadow-inner">
            <div className="mb-2 text-[#ad65dd] font-semibold">
                Deployment Logs
            </div>
            <div className="space-y-1">
                {logs.map((log, i) => (
                    <div 
                        key={i} 
                        className="whitespace-pre-line"
                    >
                        {log}
                    </div>
                ))}
            </div>
        </div>
    </div>
    );
};

export default DashboardMain;
