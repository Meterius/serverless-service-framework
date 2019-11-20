import { exec } from "child_process";

/**
 * Like exec but as promise based instead of callback based
 */
export function execAsync(
  command: string, options: Record<string, unknown>,
): Promise<[Error | undefined, string, string]> {
  return new Promise((resolve) => {
    exec(command, options, (err, stdout, stderr) => {
      if (err) {
        resolve([err, stdout, stderr]);
      } else {
        resolve([undefined, stdout, stderr]);
      }
    });
  });
}
