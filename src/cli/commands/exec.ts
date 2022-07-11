import {
  executeServerlessCommand,
  getService,
} from "../utility/framework";
import { GC, TB } from "../cli-types";
import { requireParameters } from "../utility/options-handling";
import { setupFrameworkContextFunction } from "../utility/command-setup";

const exec: GC = {
  name: "exec",
  description: "Executes serverless command on service",
  run: (tb: TB) => {
    (async () => {
      const [serviceName, slsCmdBase] = requireParameters(
        tb, ["service-name", "serverless-cmd"],
      );

      const framework = await setupFrameworkContextFunction(tb);

      const service = getService(framework, serviceName);

      function slsLog(msg: string, raw = false): void {
        tb.log(msg, undefined, raw);
      }

      await executeServerlessCommand(
        service,
        slsCmdBase,
        {},
        slsLog,
        false,
      );
    })().catch(console.error);
  },
};

export default exec;
