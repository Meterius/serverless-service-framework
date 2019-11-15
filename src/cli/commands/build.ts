import { requireParameter } from "../utility/options";
import {
  buildService,
} from "../utility/framework";
import { GC, TB } from "../cli-types";
import { setupFrameworkContextFunction } from "../utility/command-setup";

const build: GC = {
  name: "build",
  description: "Builds serverless template for service",
  run: async (tb: TB): Promise<void> => {
    const { context } = await setupFrameworkContextFunction(tb);
    await buildService(context, requireParameter(tb, "service-name"));
  },
};

export default build;
