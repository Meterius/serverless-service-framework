import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import { CliError } from "../utility/exceptions";
import { buildService, getService, loadFrameworkContext } from "../utility/framework";
import { getFrameworkSchemaOption, requireStageOption } from "../utility/common-options";
import { GC, TB } from "../cli-types";
import { requireParameters } from "../utility/options";

const exec: GC = {
  name: "exec",
  description: "Executes serverless command on service",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: async (tb: TB): Promise<void> => {
    const [serviceName, slsCmdBase] = requireParameters(
      tb, ["service-name", "serverless-cmd"],
    );
    const stage = requireStageOption(tb);

    const context = await loadFrameworkContext(getFrameworkSchemaOption(tb));
    const service = getService(context, serviceName);
    const buildInfo = await buildService(context, serviceName);

    const serviceDir = service.dirPath;

    const templatePath = path.relative(serviceDir, buildInfo.serverlessTemplateFilePath);

    const slsCmd = `sls ${slsCmdBase} --config "${templatePath}" --stage "${stage}"`;

    try {
      tb.print.info(chalk`Running Serverless Command: "{blue ${slsCmd}}"`);
      tb.print.info(
        chalk`In Serverless Directory: "{blue ${path.relative(process.cwd(), serviceDir)}}"`,
      );

      execSync(`npx --no-install ${slsCmd}`, {
        stdio: "inherit",
        cwd: serviceDir,
      });
    } catch (err) {
      throw new CliError("Serverless Command Failed");
    }
  },
};

export default exec;
