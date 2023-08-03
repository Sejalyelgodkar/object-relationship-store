import { Model, RelationalObject, SelectOptions, SelectorFunction, State } from "../../types";
import findMatch from "./findMatch";
import joinFields from "./joinFields";
import selectFields from "./selectFields";


export default function select<
  N extends string,
  O extends Record<string, any>
>(options: SelectOptions<N, O>): SelectorFunction<N, O> {

  const {
    from,
    where,
    fields,
    join
  } = options;

  const isWhereFunc = typeof where === "function";

  return (model: Model<N>, state: State) => {

    // @ts-ignore
    const schema = model[from] as RelationalObject<N>;
    const table = state[from];

    let result: Record<string, any> | null = null;

    // If where is an object
    if (!isWhereFunc) {

      // Get the primary key
      const primaryKey = where[schema.__primaryKey];


      // If the primary key exists, return the related object.
      if (primaryKey) {
        result = selectFields(fields, schema, table[primaryKey]);
      }


      // If there is no primary key
      if (!primaryKey) {

        // Result will be an array of objects.
        result = [];

        // Iterate over all the objects in the table
        // Test them against the where object
        // If a match is found, select the fields and break the loop.
        for (const [_, object] of Object.entries(table)) {
          const match = findMatch(where, object)
          if (match) result.push(selectFields(fields, schema, object));
        }

      }

    }


    // where is a function,
    if (isWhereFunc) {

      // Result will be an array of objects.
      result = [];

      // Iterate over all the objects in the table
      // Test them against the where function
      // If a match is found, select the fields and break the loop.
      for (const [_, object] of Object.entries(table)) {
        const match = where(object)
        if (match) result.push(selectFields(fields, schema, object));
      }
    }


    // If there is a result and we need to join some fields
    if (result && join) {

      const isAnArray = Array.isArray(result);

      if (isAnArray) {

        result
          .forEach((object: any) => {
            joinFields(object, {
              join,
              from,
              model,
              state
            })
          })
      }

      if (!isAnArray) {
        joinFields(result, {
          join,
          from,
          model,
          state
        })
      }

    }

    return result
  }
}