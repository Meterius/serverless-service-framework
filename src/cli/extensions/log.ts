import { GluegunToolbox } from "gluegun";
import chalk from "chalk";

/* eslint-disable no-param-reassign */

export type PrintFunc = (data: string) => void;

export interface LogInterface {
  /**
   * Prints formatted message with print function that defaults to process.stdout.write.
   * If title is specified the format will include it.
   * If raw is true then the message is passed directly.
   */
  log(
    msg: string,
    title?: string | undefined,
    raw?: boolean | undefined,
    print?: PrintFunc,
  ): void;

  divider(print?: PrintFunc): void;
}

export type Log = LogInterface["log"] & LogInterface;

export default function setup(tb: GluegunToolbox): void {
  function log(
    msg: string,
    title?: string | undefined,
    raw?: boolean | undefined,
    print: PrintFunc = (data: string): void => { process.stdout.write(data); },
  ): void {
    let data;
    if (raw) {
      data = msg;
    } else {
      data = chalk`SSF${title ? ` (${title})` : ""}: {yellow ${msg}}\n`;
    }

    print(data);
  }

  const logInterface: Log = Object.assign(log, {
    log,
    divider: (print?: PrintFunc): void => {
      tb.log.log(
        "-------------------------------------------------------\n",
        undefined, true, print,
      );
    },
  });

  tb.log = logInterface;
}
