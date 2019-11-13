import { GluegunCommand, GluegunToolbox } from "gluegun";

type Print = Omit<GluegunToolbox["print"], "info"> & {
  info: (msg: string, title?: string) => void;
};

export type TB = Omit<GluegunToolbox, "print"> & {
  print: Print;
};

// @ts-ignore
export type GC = GluegunCommand<TB>;
