import {
  execServerlessCommand,
  getService,
} from "../utility/framework";
import { GC, TB } from "../cli-types";
import { requireParameters } from "../utility/options-handling";
import { setupFrameworkContextFunction } from "../utility/command-setup";

const exec: GC = {
  name: "exec",
  description: "Executes serverless command on service",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  run: async (tb: TB): Promise<void> => {
    const [serviceName, slsCmdBase] = requireParameters(
      tb, ["service-name", "serverless-cmd"],
    );

    const { context, providerContext } = await setupFrameworkContextFunction(tb);

    const service = getService(context, serviceName);

    await execServerlessCommand({
      providerContext,
      tb,
      service,
      serverlessCommand: slsCmdBase,
      serverlessOptions: {},
    });
  },
};

export default exec;
