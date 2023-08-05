import { JoinOptions, Model, RelationalObject, SelectOptions, State } from "../types.js";
import findMatch from "./findMatch.js";
import selectFields from "./selectFields.js";


export default function select<
  N extends string,
  O extends Record<string, any>
>(
  model: Model<N>,
  state: State,
  selectOptions: SelectOptions<N, O>
): O | O[] | null {

  const {
    from,
    where,
    fields,
    join
  } = selectOptions;

  // If where is an array, loop over it and select.
  if (Array.isArray(where)) return where.flatMap(w => select(model, state, { ...selectOptions, where: w }))


  let result: Record<string, any> | null = null;

  // @ts-ignore
  const schema = model[from] as RelationalObject<N>;

  const table = state[from];


  // If where is all objects
  if (where === "*") {

    // Result will be all objects.
    result = Object
      .values(table)
      .map(object => selectFields(fields, schema, object))

  }


  // If where is an object
  if (typeof where === "object") {

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


  // where is a function
  if (typeof where === "function") {

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
          joinFields<N, O>(object, {
            join,
            from,
            model,
            state
          })
        })
    }

    if (!isAnArray) {
      joinFields<N, O>(result, {
        join,
        from,
        model,
        state
      })
    }

  }

  return result as O | O[] | null;
}



/**
 * This function takes in result, which it will mutate.
 * After this, any fields mentioned in "join" will become the object instead of a primaryKey
 * 
 * @param result The result object that will be mutated
 * @param options 
 */
function joinFields<
  N extends string,
  O extends Record<string, any>
>(
  result: Record<string, any>,
  options: {
    join: JoinOptions<O>[];
    from: string;
    model: Model<N>;
    state: State
  }
) {

  const {
    join,
    from,
    model,
    state,
  } = options;

  // @ts-ignore
  const schema = model[from] as RelationalObject<N>;

  join
    .forEach(({ on, fields, join }) => {

      if (!result[on]) return;

      if (!schema.__relationship[on]) throw new Error(`Field "${on}" does not exist in object "${from}"`);

      if (schema.__relationship[on].__has === "hasOne") {

        // Create the selector from the join statement.
        result[on] = select(model, state, {
          fields,
          from: schema.__relationship[on].__name,
          where: { [schema.__relationship[on].__primaryKey]: result[on] } as Partial<O>
        })
      }

      if (schema.__relationship[on].__has === "hasMany") {

        const matches: any[] = [];

        result[on]
          .forEach((primaryKey: any) => {

            // Create the selector from the join statement.
            const match = select(model, state, {
              fields,
              from: schema.__relationship[on].__name,
              where: { [schema.__relationship[on].__primaryKey]: primaryKey } as Partial<O>
            })

            if (match) matches.push(match);
          })

        result[on] = matches;
      }

      if (join) {
        joinFields(result[on], {
          from: schema.__relationship[on].__name,
          join,
          model,
          state
        })
      }

    })
}