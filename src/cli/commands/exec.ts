import path from "path";
import { GluegunCommand, GluegunToolbox } from "gluegun";
import { execSync } from "child_process";
import chalk from "chalk";
import { CliError } from "../utility/exceptions";
import { buildService, getService, loadFrameworkSchemas } from "../utility/framework";
import { getFrameworkSchemaOption } from "../utility/common-options";

const exec: GluegunCommand = {
  name: "exec",
  description: "Executes serverless command on service",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: async (tb: GluegunToolbox): Promise<void> => {
    const serviceName = tb.parameters.first;

    if (serviceName === undefined) {
      throw new CliError("Usage of exec: exec <service-name> [serverless command ...]");
    } else {
      const fr = await loadFrameworkSchemas(getFrameworkSchemaOption(tb));
      const se = getService(fr, serviceName);
      const bi = await buildService(fr, serviceName);

      const slsBaseCmd = tb.parameters.raw.slice(
        tb.parameters.raw.findIndex((item: string) => item === serviceName) + 1,
      ).join(" ");

      const templatePath = path.relative(se.dirPath, bi.serverlessTemplateFilePath);

      const slsCmd = `sls ${slsBaseCmd} --config "${templatePath}"`;

      try {
        tb.print.info(chalk`Running Serverless Command: "{blue ${slsCmd}}"`);
        tb.print.info(
          chalk`In Serverless Directory: "{blue ${path.relative(process.cwd(), se.dirPath)}}"`,
        );

        execSync(`npx --no-install ${slsCmd}`, {
          stdio: "inherit",
          cwd: se.dirPath,
        });
      } catch (err) {
        throw new CliError("Serverless Command Failed");
      }
    }
  },
};

export default exec;
