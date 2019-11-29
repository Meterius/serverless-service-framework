import { APD, BaseCollection, ClassCollection } from "./abstract-provider-definition";

export abstract class AbstractBase<
  D extends APD, // AbstractProviderDefinition
> {
  private readonly base: BaseCollection<D>;

  constructor(base: BaseCollection<D>) {
    this.base = base;
  }

  protected get classes(): ClassCollection<D> {
    return this.base.classes;
  }
}
