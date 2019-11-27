import { loadTypescriptModules } from "../../common/module-loading";
import { isObject } from "../../common/type-guards";
import { FrameworkContext } from "../../framework/classes";
import { HookEnv } from "./hook-execution";

async function main(): Promise<void> {
  // @ts-ignore
  const hookEnv: HookEnv = process.env;

  const encodedContext = hookEnv.SSF_HOOK_FRAMEWORK_CONTEXT;
  const serviceId = hookEnv.SSF_HOOK_SERVICE_ID;
  const hookName = hookEnv.SSF_HOOK_NAME;
  const hookPath = hookEnv.SSF_HOOK_PATH;

  const context = FrameworkContext.deserialize(encodedContext);
  const service = context.referenceService(serviceId);

  const hookFile = (await loadTypescriptModules(
    [hookPath], context.schema.options,
  ))[0];

  if (!isObject(hookFile)) {
    throw new Error("Service Hook File does not export an object");
  }

  const hookFunc = hookFile[hookName];

  if (!(hookFunc instanceof Function)) {
    throw new Error(`Service Hook "${hookName}" is not a function`);
  }

  await hookFunc(service);
}

main().then(() => {}, (err) => { console.error(err); process.exit(1); });
