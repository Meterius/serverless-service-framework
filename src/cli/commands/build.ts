import { GluegunCommand, GluegunToolbox } from "gluegun";
import { getOption, requireParameters } from "../utility/options";
import {
  getFrameworkSchemaFilePath,
  getServiceSchemaFileByName,
  loadFrameworkSchemaFile,
  loadServiceSchemaFiles,
} from "../../framework/schema-handling";
import {
  buildServiceServerlessTemplate,
} from "../../framework/template-handling";
import { CliError } from "../utility/exceptions";

const build: GluegunCommand = {
  name: "build",
  description: "Builds serverless template for service",
  run: async (tb: GluegunToolbox): Promise<void> => {
    const [serviceName] = requireParameters(tb, "service-name");
    const schemaFilePath = getOption(tb, "schema")
      || await getFrameworkSchemaFilePath(process.cwd());

    if (schemaFilePath === undefined) {
      throw new CliError("Didn't find framework schema file");
    }

    const frFile = await loadFrameworkSchemaFile(schemaFilePath);
    const seFiles = await loadServiceSchemaFiles(frFile);
    const seFile = getServiceSchemaFileByName(seFiles, serviceName);

    if (seFile === undefined) {
      throw new CliError(`Service "${serviceName}" not found`);
    } else {
      await buildServiceServerlessTemplate(frFile, seFile);
    }
  },
};

export default build;
