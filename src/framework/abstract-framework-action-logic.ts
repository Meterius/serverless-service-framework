import {
  APD, BaseParameter, Framework, Service,
} from "./abstract-provider-definition";
import { AbstractBase } from "./abstract-base";

/**
 * Class to define how dependent actions can be performed on services.
 */
export class AbstractFrameworkActionLogic<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  public readonly framework: Framework<D>;

  constructor(base: BaseParameter<D>, framework: Framework<D>) {
    super(base);

    this.framework = framework;
  }

  /**
   * Returns all services not in the performed services array.
   */
  getNotPerformedServices(performedServices: Service<D>[]): Service<D>[] {
    return this.framework.services.filter(
      (service: Service<D>) => !performedServices.includes(service),
    );
  }

  /**
   * Returns all services that are regarded as performed
   * when only performing on a subset of all services.
   */
  getPerformedServices(toBePerformedServices: Service<D>[]): Service<D>[] {
    return this.framework.services.filter(
      (service: Service<D>) => !toBePerformedServices.includes(service),
    );
  }

  /**
   * Returns list of services that can have an action performed on them.
   * The decision is based on whether all the imported services have already had the action
   * performed on them. (Example would be deploying, then it returns all services that can be
   * deployed based on the ones that have already been deployed, since for a service to be
   * deployed the ones it imports have to already exist)
   *
   * If reverse dependencies is true, instead of using imported services it looks at
   * whether all services exported to have already had the action
   * performed on them. (Example would be removal, then it returns all services that can
   * be removes based on the ones that have already been removed, since for a service to be
   * removed the ones importing it cannot still import it)
   *
   * Will return an empty array
   */
  getAllPerformable(
    performedServices: Service<D>[],
    reverseDependencies = false,
  ): Service<D>[] {
    return this.getNotPerformedServices(performedServices).filter(
      (service) => (
        reverseDependencies ? service.exportedToServices : service.importedServices
      ).every(
        (importedService) => performedServices.includes(importedService),
      ),
    );
  }

  /**
   * Like getAllPerformable but only returns one performable service.
   * Or none if all services are already performed.
   */
  getNextPerformable(
    performedServices: Service<D>[],
    reverseDependencies = false,
  ): Service<D> | undefined {
    return this.getAllPerformable(performedServices, reverseDependencies)[0];
  }

  /**
   * Returns sequential order of services in which each service can be have the action performed
   * on them if previous entries have already had the action performed on them.
   */
  getTotalSequentialOrder(reversedDependencies = false): Service<D>[] {
    const order: Service<D>[] = [];

    for (
      let nextService = this.getNextPerformable(order, reversedDependencies);
      nextService !== undefined;
      nextService = this.getNextPerformable(order, reversedDependencies)
    ) {
      order.push(nextService);
    }

    return order;
  }
}
