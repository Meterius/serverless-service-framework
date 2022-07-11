import { GluegunCommand, GluegunToolbox } from "gluegun";
import { Log } from "./extensions/log";

export interface TB extends GluegunToolbox {
  log: Log;
}

export type GC = GluegunCommand<TB>;
