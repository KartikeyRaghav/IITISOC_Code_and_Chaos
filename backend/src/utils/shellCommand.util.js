import { exec } from "child_process";

export const runShellCommand = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        return reject(stderr || error.message);
      }
      resolve(stdout);
    });
  });
