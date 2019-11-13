import { GluegunCommand, GluegunToolbox } from "gluegun";
import { getOption, requireParameters } from "../utility/options";
import { buildService, loadFrameworkSchemas } from "../utility/framework";

const build: GluegunCommand = {
  name: "build",
  description: "Builds serverless template for service",
  run: async (tb: GluegunToolbox): Promise<void> => {
    const fr = await loadFrameworkSchemas(getOption(tb, "schema"));
    await buildService(fr, requireParameters(tb, "service-name")[0]);
  },
};

export default build;
