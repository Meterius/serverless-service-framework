import { GluegunCommand, GluegunToolbox } from "gluegun";

export interface TB extends GluegunToolbox {
  /**
   * Prints formatted message with print functions that defaults to process.stdout.write.
   * If title is specified the format will include it.
   * If raw is true then the message is passed directly.
   */
  log: (
    msg: string,
    title?: string | undefined,
    raw?: boolean | undefined,
    print?: (data: string) => void,
  ) => void;
}

// @ts-ignore
export type GC = GluegunCommand<TB>;
