"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}) => {
  const wordsArray = words.split(" ");

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      filter: filter ? "blur(10px)" : "none",
    },
    visible: {
      opacity: 1,
      filter: filter ? "blur(0px)" : "none",
      transition: {
        duration,
      },
    },
  };

  return (
    <motion.div
      className={`font-bold ${className ?? ""}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <div className="my-4">
        <div className="dark:text-white text-black leading-snug tracking-wide">
          {wordsArray.map((word, idx) => (
            <motion.span
              key={word + idx}
              variants={child}
              className={`${
                idx > 3 ? "text-purple-300" : "dark:text-white text-black"
              } inline-block mr-1`}
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

TextGenerateEffect.propTypes = {
  words: PropTypes.string.isRequired,
  className: PropTypes.string,
  filter: PropTypes.bool,
  duration: PropTypes.number,
};
