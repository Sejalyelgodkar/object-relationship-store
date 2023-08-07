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
  schema: ORS.RelationalObject<N>,
  object: O
) {

  const result: O = {} as O;

  function mapOverFields(fields: (keyof O)[]) {
    fields
      .forEach((field) => {

        const value = object[field];

        const relation = schema.__relationship[field as string];

        // If this field is not a related field, set it.
        if (!relation) return result[field] = value;

        // If this field is a hasOne, set it as the primaryKeyValue
        if (relation.__has === "hasOne") return result[field] = value[relation.__primaryKey];

        // This field is a hasMany, value is an array.
        // Map over it and get all the primaryKeyValues.
        result[field] = value.map((object: any) => object[relation.__primaryKey])
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