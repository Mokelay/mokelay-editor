import { previewSchemaSelection } from '@/processors';
import {
  $remote as resolveDatasourceRemote,
  normalizeDatasource,
  normalizeDatasourceMatchingExternalFields,
  type DatasourceRequestOptions,
  type DatasourceSchemaSelections,
  type JsonValue,
  type MDatasourceApiObject,
  type MDatasourceMatchingExternalField
} from '@/utils/datasource';

export type DatasourceRuntimeSchemaSelectionData = DatasourceSchemaSelections[number] & {
  value: JsonValue;
};

export type DatasourceRuntimeMatchingExternalFieldData = MDatasourceMatchingExternalField & {
  value?: JsonValue;
};

export type DatasourceRuntimeData = {
  rawResponse: JsonValue;
  schemaSelectionData: DatasourceRuntimeSchemaSelectionData[];
  matchingExternalFieldData: DatasourceRuntimeMatchingExternalFieldData[];
};

export async function resolveDatasourceRuntimeData(
  value: MDatasourceApiObject,
  options?: DatasourceRequestOptions
): Promise<DatasourceRuntimeData> {
  const datasource = normalizeDatasource(value);
  const rawResponse = await resolveDatasourceRemote(datasource, options);
  const schemaSelections = datasource.schemaSelections ?? [];
  const schemaSelectionData = schemaSelections.map((selection) => ({
    ...selection,
    value: previewSchemaSelection(rawResponse, selection).finalValue
  }));
  const schemaSelectionDataByPath = new Map(schemaSelectionData.map((field) => [field.path, field.value]));
  const matchingExternalFields = datasource.type === 'API'
    ? normalizeDatasourceMatchingExternalFields(datasource.matchingExternalFields)
    : [];

  return {
    rawResponse,
    schemaSelectionData,
    matchingExternalFieldData: matchingExternalFields.map((field) => ({
      ...field,
      value: field.matchFieldPath ? schemaSelectionDataByPath.get(field.matchFieldPath) : undefined
    }))
  };
}
