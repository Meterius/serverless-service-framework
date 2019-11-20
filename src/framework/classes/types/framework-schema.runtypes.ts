import {
  Record, Union, Partial, Literal, Intersect, String,
} from "runtypes";
import { InlineFrameworkTemplate } from "../../templates.runtypes";
import { CommonSchemaProperties } from "./common-schema.runtypes";

/*
 * Runtypes
 */

const InlineFrameworkTemplateProperties = Record({
  template: InlineFrameworkTemplate,
}).And(Partial({
  templateType: Union(Literal("inline")),
}));

const TemplateProperties = Union(InlineFrameworkTemplateProperties);

const BaseProperties = Record({
  name: String,
  shortName: String,
  serviceRootDir: String,
});

export const FrameworkSchemaProperties = Intersect(
  BaseProperties, TemplateProperties, CommonSchemaProperties,
);
