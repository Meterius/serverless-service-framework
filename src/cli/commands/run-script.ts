import { GC, TB } from "../cli-types";
import { requireParameters } from "../utility/options-handling";
import { setupFrameworkContextFunction } from "../utility/command-setup";
import { loadTypescriptModule } from "../../common/module-loading";
import { isObject } from "../../common/type-guards";
import { CliError } from "../utility/exceptions";

const runScriptCommand: GC = {
  name: "run-script",
  description: "Runs a function of a typescript script and gives it an initialized framework instance",
  run: (tb: TB) => {
    (async () => {
      const [tsFile, tsExportName] = requireParameters(tb, ["ts-file-path", "ts-export-name"]);

      const framework = await setupFrameworkContextFunction(tb);

      const tsModule = await loadTypescriptModule(framework.resolvePath(tsFile), framework.schema.options);

      const tsExport = isObject(tsModule) ? tsModule[tsExportName] : undefined;

      if (!(tsExport instanceof Function)) {
        throw new CliError(`TS Script "${tsFile}" does not export function at export "${tsExportName}"`);
      }

      await tsExport(framework);
    })().catch(console.error);
  },
};

export default runScriptCommand;
