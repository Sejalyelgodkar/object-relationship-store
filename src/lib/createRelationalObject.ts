import { type ORS} from "./types";


function has<N extends string>(object: ORS.RelationalObject<N>, __has: ORS.Has<N>["__has"], __alias: string,): ORS.Has<N> {
  const {
    __name,
    __primaryKey,
  } = object;

  const relationship = {
    __name,
    __primaryKey,
    __has,
    __alias,
  }

  return relationship
}


export function createRelationalObject<
N extends string
>(
  name: N,
  schema: ORS.Schema,
  options?: { primaryKey?: string }
): ORS.RelationalCreator<N> {

  const object = {
    ...schema,
    __name: name,
    __primaryKey: options?.primaryKey ?? "id",
    __relationship: { },
  }

  Object.setPrototypeOf(object, {

    hasOne(object: ORS.RelationalObject<N>, as?: string) {
      const self = this as unknown as ORS.RelationalObject<N>;
      const name: any = as ?? object.__name;

      const existing = Object.entries(self.__relationship).find(([alias, has]) => has.__name === object.__name);
      if (
        existing &&
        (
          self.__relationship[existing[0]].__primaryKey === object.__primaryKey &&
          object.__primaryKey === self.__name
        )
      ) throw new Error(`"${object.__name}" reference already exists in "${self.__name}" as "${existing[0]}" with the primary key (pk) "${object.__primaryKey}". "${self.__name}" table failed to create a hasOne relationship with "${name}" because it has the same primary key "${object.__primaryKey}" as "${existing[0]}". The primary key for "${existing[0]}" and "${name}" are not unique.`);

      self[name] = "hasOne"
      self.__relationship[name] = has(object, "hasOne", name);

      return this;
    },

    hasMany(object: ORS.RelationalObject<N>, as?: string) {
      const self = this as unknown as ORS.RelationalObject<N>;
      const name: any = as ?? object.__name;

      const existing = Object.entries(self.__relationship).find(([alias, has]) => has.__name === object.__name)
      if (
        existing &&
        (
          self.__relationship[existing[0]].__primaryKey === object.__primaryKey &&
          object.__primaryKey === self.__name
        )
      ) throw new Error(`"${object.__name}" reference already exists in "${self.__name}" as "${existing[0]}" with the primary key (pk) "${object.__primaryKey}". "${self.__name}" table failed to create a hasOne relationship with "${name}" because it has the same primary key "${object.__primaryKey}" as "${existing[0]}". The primary key for "${existing[0]}" and "${name}" are not unique.`);

      self[name] = "hasMany"
      self.__relationship[name] = has(object, "hasMany", name);

      return this;
    },

  });

  return object as unknown as ORS.RelationalCreator<N>
}
