import { createHookCommand, runPrePackage } from "../utility/hook-execution";

export default createHookCommand("prePackage", runPrePackage);
