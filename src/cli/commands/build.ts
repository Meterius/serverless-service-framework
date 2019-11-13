import { requireParameter } from "../utility/options";
import { buildService, loadFrameworkContext } from "../utility/framework";
import { getFrameworkSchemaOption } from "../utility/common-options";
import { GC, TB } from "../cli-types";

const build: GC = {
  name: "build",
  description: "Builds serverless template for service",
  run: async (tb: TB): Promise<void> => {
    const fr = await loadFrameworkContext(getFrameworkSchemaOption(tb));
    await buildService(fr, requireParameter(tb, "service-name"));
  },
};

export default build;
