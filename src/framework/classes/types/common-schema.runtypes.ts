import {
  String, Partial, Record, Literal, Union, Dictionary, Array,
} from "runtypes";

/*
 *  Runtypes
 */

export const ImportType = Union(Literal("direct"), Literal("provider-based"));

export const ImportValue = Union(
  String,
  Record({ name: String }).And(Partial({ type: ImportType })),
);

export const ImportMap = Dictionary(Array(ImportValue));

export const ExportValue = String;

export const ExportMap = Dictionary(ExportValue);

export const ImportSettings = Partial({
  defaultImportType: ImportType,
});

export const ExportSettings = Partial({});

export const DependencySettingsProperties = Partial({
  importSettings: ImportSettings,
  exportSettings: ExportSettings,
});

export const CommonSchemaProperties = Union(DependencySettingsProperties);
