import { GC } from "../cli-types";
import { createMultiServiceCommandRun } from "../utility/service-command";

const deployCommand: GC = {
  name: "deploy",
  description: "Deploys serverless services",
  run: createMultiServiceCommandRun(
    "Deploy",
    {
      pastSimple: "deployed", presentContinuous: "deploying",
    },
    "deploy",
  ),
};

export default deployCommand;
