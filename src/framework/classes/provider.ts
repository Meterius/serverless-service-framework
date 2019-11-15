import { ServerlessProviderName } from "../types";

export abstract class Provider {
  public abstract readonly name: ServerlessProviderName;
}
