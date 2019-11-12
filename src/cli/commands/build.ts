import { GluegunCommand, GluegunToolbox } from "gluegun";
import { requireOption, requireParameters } from "../utility/options";
import {
  getServiceSchemaFileByName,
  loadFrameworkSchemaFile,
  loadServiceSchemaFiles,
} from "../../framework/schema-file-handling";
import {
  createServiceServerlessTemplate,
  serializeServiceServerlessTemplate, writeServiceServerlessTemplate,
} from "../../framework/template-handling";

const build: GluegunCommand = {
  name: "build",
  description: "Builds serverless template for service",
  run: async (tb: GluegunToolbox): Promise<void> => {
    const [serviceName] = requireParameters(tb, "service-name");
    const schemaFilePath = requireOption(tb, "schema");

    const frFile = await loadFrameworkSchemaFile(schemaFilePath);
    const seFiles = await loadServiceSchemaFiles(frFile);
    const seFile = getServiceSchemaFileByName(seFiles, serviceName);

    if (seFile === undefined) {
      throw new Error(`No Service named "${serviceName}"`);
    } else {
      const template = createServiceServerlessTemplate(frFile.schema, seFile.schema);
      const serTemp = serializeServiceServerlessTemplate(template);
      writeServiceServerlessTemplate(seFile, serTemp);
    }
  },
};

export default build;
