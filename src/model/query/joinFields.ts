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
  N extends string
>(
  result: Record<string, any>,
  options: {
    join: JoinOptions<any>[];
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
        const joinSelector = select({
          fields: fields as any,
          from: schema.__relationship[on].__name,
          where: { [schema.__relationship[on].__primaryKey]: result[on] }
        })

        result[on] = joinSelector(model, state);
      }

      if (schema.__relationship[on].__has === "hasMany") {

        const matches: any[] = [];

        result[on]
          .forEach((primaryKey: any) => {

            // Create the selector from the join statement.
            const joinSelector = select({
              fields: fields as any,
              from: schema.__relationship[on].__name,
              where: { [schema.__relationship[on].__primaryKey]: primaryKey }
            })

            const match = joinSelector(model, state);
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