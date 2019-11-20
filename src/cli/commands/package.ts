import { GC } from "../cli-types";
import { createMultiServiceCommandRun } from "../utility/multi-service-command";

const packageCommand: GC = {
  name: "package",
  description: "Packages serverless services",
  run: createMultiServiceCommandRun(
    "Package",
    {
      pastSimple: "packaged", presentContinuous: "packaging",
    },
    "package",
  ),
};

export default packageCommand;
