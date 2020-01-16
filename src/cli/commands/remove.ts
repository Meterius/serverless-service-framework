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
    frameworkOptionsOverwrite: {
      stubDirectImports: "__remove-template-uses-stubbed-direct-import-values__",
    },
  }),
};

export default removeCommand;
