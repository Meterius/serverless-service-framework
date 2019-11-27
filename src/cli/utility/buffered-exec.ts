import chalk from "chalk";
import { execSync } from "child_process";
import { execAsync } from "../../common/os";

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
