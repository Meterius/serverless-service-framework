import { GC } from "../cli-types";
import { createMultiServiceCommandRun } from "../utility/service-command";

const removeCommand: GC = {
  name: "remove",
  description: "Removes serverless services",
  run: createMultiServiceCommandRun(
    "Remove",
    {
      pastSimple: "removed", presentContinuous: "removing",
    },
    "remove",
  ),
};

export default removeCommand;
