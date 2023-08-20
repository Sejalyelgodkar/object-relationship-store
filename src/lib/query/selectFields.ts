import { type ORS } from "../types";


/**
 * This method does not mutate the object,
 * It creates a copy and returns a new object with the selected fields
 * 
 * @param fields Fields to select from the object
 * @param schema The object schema
 * @param object The object to select the fields from.
 * @returns A copy of the object
 */
export default function selectFields<
  N extends string,
  O extends Record<string, any>
>(
  fields: ORS.SelectOptions<N, O>["fields"],
  object: O
) {

  if (!object) return null;

  const result: O = {} as O;

  function mapOverFields(fields: (keyof O)[]) {
    fields
      .forEach((field) => {
        const value = object[field];
        if (value === undefined) return;
        result[field] = value;
      })
  }

  /**
   * If we are returning all fields, select everything and all relations,
   * replace them with their primary key
   */
  if (fields === "*")
    mapOverFields(Object.keys(object))
  else
    mapOverFields(fields as string[])

  return result
}