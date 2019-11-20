import {
  Record, Partial, Literal, Union, String, Dictionary, Unknown, Intersect, Undefined,
} from "runtypes";

const FrameworkProviderName = Union(
  Literal("aws"),
);

const FrameworkService = Partial({
  name: Undefined,
}).And(Dictionary(Unknown));

const FrameworkProvider = Intersect(
  Record({
    name: FrameworkProviderName,
    region: String,
  }),
  Partial({
    stage: Undefined,
    stackName: Undefined,
  }),
  Dictionary(Unknown),
);

const FrameworkCustom = Intersect(
  Partial({
    imports: Undefined,
  }),
  Dictionary(Unknown),
);

const FrameworkResources = Dictionary(Unknown);

export const InlineFrameworkTemplate = Intersect(
  Record({
    provider: FrameworkProvider,
  }),
  Partial({
    service: FrameworkService,
    custom: FrameworkCustom,
    resources: FrameworkResources,
  }),
  Dictionary(Unknown),
);

const ServiceService = FrameworkService;

const ServiceProvider = Partial({
  name: Undefined,
  region: Undefined,

  stage: Undefined,
  stackName: Undefined,
}).And(Dictionary(Unknown));

const ServiceCustom = Partial({
  imports: Undefined,
}).And(Dictionary(Unknown));

const ServiceResources = FrameworkResources;

export const InlineServiceTemplate = Partial({
  service: ServiceService,
  provider: ServiceProvider,
  custom: ServiceCustom,
  resources: ServiceResources,
}).And(Dictionary(Unknown));
