import { APD, ClassCollection } from "./abstract-provider-definition";

export interface AbstractBaseCollection<
  D extends APD
> {
  classes: ClassCollection<D>;
}
