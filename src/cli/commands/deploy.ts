import { GC } from "../cli-types";
import { createMultiServiceCommandRun } from "../utility/multi-service-command";

const deployCommand: GC = {
  name: "deploy",
  description: "Deploys serverless services",
  run: createMultiServiceCommandRun({
    actionTitle: "Deploy",
    actionPhrases: {
      pastSimple: "deployed",
      presentContinuous: "deploying",
    },
    actionServerlessCommand: "deploy",
  }),
};

export default deployCommand;
