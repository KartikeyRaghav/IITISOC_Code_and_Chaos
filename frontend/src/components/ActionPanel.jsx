const ActionPanel = ({ onGetRepos, onGetUserRepos }) => {
    return (
        <section className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 p-8 space-y-6 min-h-screen">
            <button
                onClick={onGetRepos}
                className="w-64 bg-gradient-to-r from-[#005b83] via-[#0077ab] to-purple-500 hover:from-[#005379] hover:via-[#0070a1] hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
            >
                Connect GitHub
            </button>
            <button
                onClick={onGetUserRepos}
                className="w-64 bg-gradient-to-r from-[#005b83] via-[#0077ab] to-purple-500 hover:from-[#005379] hover:via-[#0070a1] hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
            >
                Get Repos 
            </button>
        </section>
    );
}
export default ActionPanel;
