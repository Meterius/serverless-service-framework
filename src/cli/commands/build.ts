import { GluegunCommand, GluegunToolbox } from "gluegun";
import { requireParameters } from "../utility/options";
import { buildService, loadFrameworkSchemas } from "../utility/framework";
import { getFrameworkSchemaOption } from "../utility/common-options";

const build: GluegunCommand = {
  name: "build",
  description: "Builds serverless template for service",
  run: async (tb: GluegunToolbox): Promise<void> => {
    const fr = await loadFrameworkSchemas(getFrameworkSchemaOption(tb));
    await buildService(fr, requireParameters(tb, "service-name")[0]);
  },
};

export default build;
