import chalk from "chalk";
import { exec, execSync } from "child_process";

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

export interface BufferedExecParams {
  env: Record<string, string | undefined>;
  cwd: string;
  command: string;

  log: (data: string) => void;
  async: boolean;
}

export async function bufferedExec(params: BufferedExecParams): Promise<void> {
  const {
    cwd, env, command, log,
  } = params;

  const options = { cwd, env };

  if (params.async) {
    const [err, stdout, stderr] = await execAsync(command, options);

    log(stdout);
    log(chalk`{red ${stderr}}`);

    if (err) {
      throw err;
    }
  } else {
    log("-----------------------------------------------------\n");

    let err;
    try {
      execSync(command, {
        ...options,
        stdio: "inherit",
      });
    } catch (execErr) {
      err = execErr;
    }

    log("-----------------------------------------------------\n");

    if (err) {
      throw err;
    }
  }
}
