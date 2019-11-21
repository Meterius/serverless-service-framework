import { GC } from "../cli-types";
import { createMultiServiceCommandRun } from "../utility/multi-service-command";

const packageCommand: GC = {
  name: "package",
  description: "Packages serverless services",
  run: createMultiServiceCommandRun({
    actionTitle: "Package",
    actionPhrases: {
      pastSimple: "packaged",
      presentContinuous: "packaging",
    },
    actionServerlessCommand: "package",
  }),
};

export default packageCommand;
