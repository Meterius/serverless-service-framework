import { GC } from "../cli-types";
import { createMultiServiceCommandRun } from "../utility/multi-service-command";

const removeCommand: GC = {
  name: "remove",
  description: "Removes serverless services",
  run: createMultiServiceCommandRun(
    "Remove",
    {
      pastSimple: "removed", presentContinuous: "removing",
    },
    "remove",
    true,
  ),
};

export default removeCommand;
