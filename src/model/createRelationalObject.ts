import { Has, RelationalCreator, RelationalObject, Schema } from "../types";


function has<N extends string>(object: RelationalObject<N>): Has<N> {
  const {
    __name,
    __primaryKey,
  } = object;

  const relationship = {
    __name,
    __primaryKey
  }

  return relationship
}


export function createRelationalObject<
N extends string
>(
  name: N,
  schema: Schema,
  options?: { primaryKey?: string }
): RelationalCreator<N> {

  const object = {
    ...schema,
    __name: name,
    __primaryKey: options?.primaryKey ?? "id",
    __relationship: { __alias: {} },
  }

  Object.setPrototypeOf(object, {

    hasOne(object: RelationalObject<N>, as?: string) {
      const self = this as unknown as RelationalObject<N>;
      const name: any = as ?? object.__name;

      const existing = Object.entries(self.__relationship.__alias).find(([alias, table]) => table === object.__name);

      if (
        existing &&
        (
          (self.__relationship[existing[0]] as RelationalObject<N>).__primaryKey === object.__primaryKey &&
          object.__primaryKey === self.__name
        )
      ) throw new Error(`"${object.__name}" reference already exists in "${self.__name}" as "${existing[0]}" with the primary key (pk) "${object.__primaryKey}". "${self.__name}" table failed to create a hasOne relationship with "${name}" because it has the same primary key "${object.__primaryKey}" as "${existing[0]}". The primary key for "${existing[0]}" and "${name}" are not unique.`);

      self[name] = "hasOne"
      self.__relationship[name] = has(object);
      self.__relationship.__alias[name] = object.__name;

      return this;
    },

    hasMany(object: RelationalObject<N>, as?: string) {
      const self = this as unknown as RelationalObject<N>;
      const name: any = as ?? object.__name;

      const existing = Object.entries(self.__relationship.__alias).find(([alias, table]) => table === object.__name)
      if (
        existing &&
        (
          (self.__relationship[existing[0]] as RelationalObject<N>).__primaryKey === object.__primaryKey &&
          object.__primaryKey === self.__name
        )
      ) throw new Error(`"${object.__name}" reference already exists in "${self.__name}" as "${existing[0]}" with the primary key (pk) "${object.__primaryKey}". "${self.__name}" table failed to create a hasOne relationship with "${name}" because it has the same primary key "${object.__primaryKey}" as "${existing[0]}". The primary key for "${existing[0]}" and "${name}" are not unique.`);

      self[name] = "hasMany"
      self.__relationship[name] = has(object);
      self.__relationship.__alias[name] = object.__name;

      return this;
    },

  });

  return object as unknown as RelationalCreator<N>
}
