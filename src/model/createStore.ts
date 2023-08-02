import { CreateStoreConfig, Model, RelationalObject, State } from "../types";

export function createStore<N extends string>(config: CreateStoreConfig<N>) {


  const {
    relationalCreators,
    identifier,
  } = config;


  const state = {} as State;


  const listeners = new Set<() => void>();


  const model = relationalCreators
    .reduce((r, t) => {
      const { hasOne, hasMany, ...next } = t
      const k = next.__relationship.__alias[next.__primaryKey] ?? next.__primaryKey;
      if (!(next as any)[k]) throw new Error(`The table "${next.__name}" does not have a primary key (pk) "${t.__primaryKey}", pk should be listed here ${JSON.stringify(t)}`);
      return { ...r, [next.__name]: next }
    }, {} as Model<N>)


  function identify(item: any): string {
    for (const key in identifier) {
      if (!Object.prototype.hasOwnProperty.call(identifier, key)) continue;
      const validator = identifier[key];
      if (validator(item)) return key;
    }
    throw new Error(`Identifier was not able to identify this object ${JSON.stringify(item)}`);
  }


  function select() {
    return state
  }


  function upsert(object: any) {
    const items = Array.isArray(object) ? object : [object];

    function upsertOne(params: {
      item: any;
      parentName?: string;
      parentField?: string;
      parentPrimaryKey?: string;
      parentFieldHasMany?: boolean;
    }) {

      const {
        item,
        parentName,
        parentField,
        parentFieldHasMany,
        parentPrimaryKey,
      } = params;

      const name = identify(item);

      // @ts-ignore
      const relationalObject: RelationalObject<N> = model[name];

      const primaryKey = relationalObject.__primaryKey;

      const relatedFields = <string[]>[];

      // If this table does not exist, initialize it.
      if (!state[name]) state[name] = {};

      // If the record does not exist, create an empty obj
      if(!state[name][item[primaryKey]]) state[name][item[primaryKey]] = {};

      for (const [field, value] of Object.entries(item)) {

        // If this field is a related field, add it to the relatedFields list.
        if (!!relationalObject.__relationship[field]) {
          relatedFields.push(field);
          continue;
        }
        
        state[name][item[primaryKey]][field] = value;
      }


      if (parentName && parentField && parentPrimaryKey) {
        if (parentFieldHasMany) {
          const existingItems = state[parentName][parentPrimaryKey][parentField];
          const currentItem = state[name][item[primaryKey]];
          const isAnArray = Array.isArray(existingItems);
          if (!isAnArray) state[parentName][parentPrimaryKey][parentField] = [currentItem]
          if (isAnArray) {
            const exists = !!existingItems.find((i: any) => i[primaryKey] === currentItem[primaryKey]);
            if (!exists) existingItems.push(currentItem)
          }
        }
        if (!parentFieldHasMany) {
          state[parentName][parentPrimaryKey][parentField] = state[name][item[primaryKey]]
        }
      }

      for (let i = 0; i < relatedFields.length; i++) {
        const field = relatedFields[i];
        // @ts-ignore
        const hasMany = relationalObject[field] === "hasMany";

        if (!hasMany) {
          upsertOne({
            item: item[field],
            parentPrimaryKey: item[primaryKey],
            parentField: field,
            parentName: name,
          })
          continue;
        }

        item[field].forEach((oneItem: any) => {
          upsertOne({
            item: oneItem,
            parentPrimaryKey: item[primaryKey],
            parentField: field,
            parentName: name,
            parentFieldHasMany: true,
          })
        })
      }
    }

    items.forEach(item => upsertOne({ item }))

    // console.log("BEFORE")
    // console.log(state.user[2].profileImage.thumbnails[0])
    // console.log(state.thumbnail[186])

    // state.user[2].profileImage.thumbnails[0].uri = "Hello"

    // console.log("AFTER")
    // console.log(state.user[2].profileImage.thumbnails[0])
    // console.log(state.thumbnail[186])

    // console.log("BEFORE")
    // console.log(state.user[2].username)
    // console.log(state.post[10].user)

    // state.user[2].username = "--updated"
    // // state.post[9].user.username  = "--updated"

    // console.log("AFTER")
    // console.log(state.user[2].username)
    // console.log(state.post[10].user.username)

    listeners.forEach((listener) => listener());
  }


  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }


  return { model, state, upsert, subscribe }
}

