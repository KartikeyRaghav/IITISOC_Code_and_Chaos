import { exec } from "child_process";

export const runShellCommand = (cmd) =>
  new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(error);
        return reject(stderr || error.message);
      }
      resolve(stdout);
    });
  });
