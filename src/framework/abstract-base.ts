import {
  APD, BaseCollection, BaseParameter, ClassCollection,
} from "./abstract-provider-definition";

export abstract class AbstractBase<
  D extends APD, // AbstractProviderDefinition
> {
  private readonly base: BaseCollection<D>;

  constructor(base: BaseParameter<D>) {
    // note that a function is used to prevent circular import problems when using classes as values
    this.base = base();
  }

  protected get classes(): ClassCollection<D> {
    return this.base.classes;
  }
}
