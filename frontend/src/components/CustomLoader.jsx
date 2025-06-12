import { motion } from "framer-motion";
import { SyncLoader } from "react-spinners";

const CustomLoader = ({ text }) => {
  const loaderColor = "#ffffff";
  const loaderText = text || "Loading your dashboard...";
  const backColorProps = "from-custom-blue-900 to-custom-blue-950";

  return (
    <div
      className={`flex flex-col items-center justify-center h-screen bg-gradient-to-br ${backColorProps}`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <SyncLoader color={loaderColor} radius={20} height={20} width={5} />
      </motion.div>
      <p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-white font-bold"
      >
        {loaderText}
      </p>
    </div>
  );
};

export default CustomLoader;
