import { JoinOptions, Model, RelationalObject, State } from "../../types";
import select from "./select";

/**
 * This function takes in result, which it will mutate.
 * After this, any fields mentioned in "join" will become the object instead of a primaryKey
 * 
 * @param result The result object that will be mutated
 * @param options 
 */
export default function joinFields<
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

      if (!result[on]) throw new Error(`Expected "${on}" in object "${from}" to be a primaryKey or an array of primaryKey`);

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