import { GluegunToolbox } from "gluegun";
import chalk from "chalk";

/* eslint-disable no-param-reassign */

export default function setup(tb: GluegunToolbox): void {
  const logInfo = tb.print.info;

  function info(msg: string, title?: string): void {
    logInfo(chalk`SSF${title ? ` (${title})` : ""}: {yellow ${msg}}`);
  }

  tb.print.info = info;
}
