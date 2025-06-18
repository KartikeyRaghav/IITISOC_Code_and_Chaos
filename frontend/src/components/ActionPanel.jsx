const ActionPanel = ({ onGetRepos, onGetUserRepos, hasGithubPermission }) => {
  return (
    <section className="w-full flex flex-col items-center justify-center bg-gray-900 p-4 sm:p-6 space-y-6 min-h-[300px] lg:min-h-screen">
      <button
        onClick={onGetRepos}
        disabled={hasGithubPermission}
        className={`w-full max-w-xs bg-gradient-to-r ${
          hasGithubPermission ? "cursor-not-allowed" : ""
        } from-[#005b83] via-[#0077ab] to-purple-500 hover:from-[#005379] hover:via-[#0070a1] hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105`}
      >
        {hasGithubPermission ? "Github Connected" : "Connect GitHub"}
      </button>
      <button
        onClick={onGetUserRepos}
        className="w-full max-w-xs bg-gradient-to-r from-[#005b83] via-[#0077ab] to-purple-500 hover:from-[#005379] hover:via-[#0070a1] hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
      >
        Get Repos
      </button>
    </section>
  );
};
export default ActionPanel;
