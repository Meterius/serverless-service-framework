import { GluegunToolbox } from "gluegun";
import chalk from "chalk";

/* eslint-disable no-param-reassign */

export default function setup(tb: GluegunToolbox): void {
  /**
   * Prints formatted message with print functions that defaults to process.stdout.write.
   * If title is specified the format will include it.
   * If raw is true then the message is passed directly.
   */
  function log(
    msg: string,
    title?: string | undefined,
    raw?: boolean | undefined,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    print: (data: string) => void = (data: string): void => { process.stdout.write(data); },
  ): void {
    let data;
    if (raw) {
      data = msg;
    } else {
      data = chalk`SSF${title ? ` (${title})` : ""}: {yellow ${msg}}`;
    }

    print(`${data}\n`);
  }

  tb.log = log;
}
