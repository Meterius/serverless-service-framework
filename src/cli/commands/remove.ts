import { GC } from "../cli-types";
import { createMultiServiceCommandRun } from "../utility/multi-service-command";

const removeCommand: GC = {
  name: "remove",
  description: "Removes serverless services",
  run: createMultiServiceCommandRun({
    actionTitle: "Remove",
    actionPhrases: {
      pastSimple: "removed",
      presentContinuous: "removing",
    },
    actionServerlessCommand: "remove",
    actionDependenciesReversed: true,
    skipServiceIfNotDeployed: true,
  }),
};

export default removeCommand;
