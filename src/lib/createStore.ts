import { type ORS } from "./types.js";
import querySelect from "./query/select.js";

export function createStore<
  N extends string,
  I extends string,
  O extends string,
>(config: ORS.CreateStoreConfig<N, I, O>) {

  const {
    relationalCreators,
    indexes,
    identifier,
  } = config;


  const state = {} as ORS.State;


  const listeners = new Set<() => void>();


  const model = relationalCreators
    .reduce((r, t) => {
      const { hasOne, hasMany, ...next } = t
      const k = next.__relationship[next.__primaryKey]?.__name ?? next.__primaryKey;
      if (!(next as any)[k]) throw new Error(`The table "${next.__name}" does not have a primary key (pk) "${t.__primaryKey}", pk should be listed here ${JSON.stringify(t)}`);
      return { ...r, [next.__name]: next }
    }, {} as ORS.Model<N>)

  // @ts-ignore
  indexes?.forEach(index => model[index.__name] = index)

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }


  function identify(item: any): string {
    for (const key in identifier) {
      if (!Object.prototype.hasOwnProperty.call(identifier, key)) continue;
      const validator = identifier[key];
      if (validator(item)) return key;
    }
    throw new Error(`Identifier was not able to identify this object ${JSON.stringify(item)}`);
  }


  function upsert(object: any, options?: ORS.UpsertOptions<I>) {

    const items = Array.isArray(object) ? object : [object];

    // @ts-ignore
    const upsertIndexes = (options?.indexes ?? []).map(i => model[i]) as ORS.RelationalObjectIndex<I, O>[];

    /**
     *  If this object is related with the parent, then set the relationship
     *  E.g. the parent is a post, the current object is a user
     *  A post contains a user, so here we are.
     *  However, a user also contains posts.
     *  Here we add this post to the user appropriately, according to the
     *  relationship defined in user.
     */
    function handleChildRelationshipWithParent(params: {
      name: string;
      item: any,
      parentName: string;
      primaryKey: string;
      parentPrimaryKey: string;
      relationalObject: ORS.RelationalObject;
    }) {

      const {
        name,
        item,
        parentName,
        primaryKey,
        parentPrimaryKey,
        relationalObject
      } = params;

      // Check if I have a relationship with my parent
      const relationWithParent = Object.values(relationalObject.__relationship).find(has => has.__name === parentName);

      if (relationWithParent) {

        if (relationWithParent.__has === "hasOne") {
          state[name][item[primaryKey]][relationWithParent.__alias] = state[parentName][parentPrimaryKey];
        }

        if (relationWithParent.__has === "hasMany") {
          const existingItems = state[name][item[primaryKey]][relationWithParent.__alias];
          const currentItem = state[parentName][parentPrimaryKey];
          const isAnArray = Array.isArray(existingItems);

          // If the existing items is not an array, it's new, assign it to a
          // new array containg the current item.
          if (!isAnArray) {
            state[name][item[primaryKey]][relationWithParent.__alias] = [currentItem];
          }

          // The existing items is an array
          // Check if the current item exists. If it does not, add it.
          if (isAnArray) {
            const exists = !!existingItems.find((i: any) => i[primaryKey] === currentItem[primaryKey]);
            if (!exists) existingItems.push(currentItem)
          }
        }
      }

    }


    /**
     * Upserts a single item. Calls itself recursively based on object relationship.
     */
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


      // If the primary key does not exist on the object, we can't go forward.
      if (!item[primaryKey]) throw new Error(`Expected object "${name}" to have a primaryKey "${primaryKey}".`);


      // If this table does not exist, initialize it.
      if (!state[name]) state[name] = {};

      // If the record does not exist, create an empty obj
      if (!state[name][item[primaryKey]]) state[name][item[primaryKey]] = {};


      // If this item is indexed, add it to the index. The index is a set.
      upsertIndexes
        .forEach(index => {
          // If this object does not have an index.
          if (!index.__objects.includes(name as O)) return;

          // If it's not defined in state, initialize it.
          if (!state[index.__name]) (state[index.__name] as ORS.Index) = { index: [], objects: {} };

          // If the key already exists in the index, skip it.
          const key = `${name}-${item[primaryKey]}`;
          if (!!(state[index.__name] as ORS.Index).objects[key]) return;

          (state[index.__name] as ORS.Index).index.push(key);
          (state[index.__name] as ORS.Index).objects[key] = { name, primaryKey, primaryKeyValue: item[primaryKey] };
        })


      Object
        .entries(item)
        .forEach(([field, value]) => {

          // If this field is a related field, traverse in recursively
          if (!!relationalObject.__relationship[field]) {

            // @ts-ignore
            const hasMany = relationalObject[field] === "hasMany";

            if (!hasMany) {
              upsertOne({
                item: item[field],
                parentPrimaryKey: item[primaryKey],
                parentField: field,
                parentName: name,
              })
              return;
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
            return;
          }

          state[name][item[primaryKey]][field] = value;

        })


      // If this is a child of someone
      if (parentName && parentField && parentPrimaryKey) {

        if (parentFieldHasMany) {
          const existingItems = state[parentName][parentPrimaryKey][parentField];
          const currentItem = state[name][item[primaryKey]];

          // If the existing items is not an array, it's new, assign it to a
          // new array containg the current item.
          if (!Array.isArray(existingItems)) {
            state[parentName][parentPrimaryKey][parentField] = [currentItem];
            handleChildRelationshipWithParent({
              name,
              item,
              parentName,
              parentPrimaryKey,
              primaryKey,
              relationalObject
            })
            return;
          }

          // The existing items is an array
          // Check if the current item exists. If it does not, add it.
          const exists = !!existingItems.find((i: any) => i[primaryKey] === currentItem[primaryKey]);
          if (!exists) {
            existingItems.push(currentItem)
            handleChildRelationshipWithParent({
              name,
              item,
              parentName,
              parentPrimaryKey,
              primaryKey,
              relationalObject
            })
          }
          return;
        }

        handleChildRelationshipWithParent({
          name,
          item,
          parentName,
          parentPrimaryKey,
          primaryKey,
          relationalObject
        })

        // The child has been created
        // set the parent field to the reference of this object
        state[parentName][parentPrimaryKey][parentField] = state[name][item[primaryKey]];
      }
    }


    items.forEach(item => upsertOne({ item }))


    // Sort the indexes if any.
    upsertIndexes
      .forEach(index => {
        const sort = index.__sort;
        if (!sort) return;

        (state[index.__name] as ORS.Index)
          .index
          .sort((a, b) => {
            const itemA = (state[index.__name] as ORS.Index).objects[a]
            const itemB = (state[index.__name] as ORS.Index).objects[b]
            return sort(state[itemA.name][itemA.primaryKeyValue], state[itemA.name][itemB.primaryKeyValue])
          })
      })



    listeners.forEach(listener => listener());
  }


  const select = memo(<
    N extends string,
    O extends Record<string, any>
  >(options: ORS.SelectOptions<N, O>): O | O[] | null => {
    return querySelect<N, O>(model, state, options);
  })


  /**
   * TODO update the ts here
   * @param index The name of the index you want to select from
   * @param options The key is the name of the object, value is SelectOptions
   */
  const selectIndex = memo(<
    E extends I,
    N extends string,
    T extends Record<string, any>
  >(index: E, options?: Record<string, ORS.Replace<ORS.SelectOptions<N, T>, "where", ((object: any) => boolean)>>) => {
    const indexes = state[index] as ORS.Index;
    const result: Record<string, any>[] = [];
    if (!indexes) return null;
    indexes
      .index
      .forEach((key: string) => {
        const recordIndex = indexes.objects[key];
        const queryOptions = options ? options[recordIndex.name] : { from: recordIndex.name, fields: "*" } as ORS.Replace<ORS.SelectOptions<N, T>, "where", ((object: any) => boolean)>;

        if (!queryOptions) throw new Error(`selectIndex() expected SelectOptions for "${recordIndex.name}" in the index "${index}".`);

        const object = querySelect(model, state, { ...queryOptions, where: { [recordIndex.primaryKey]: recordIndex.primaryKeyValue } } as ORS.SelectOptions<any, any>);
        if (!object) return;
        if (!queryOptions?.where) return result.push(object);
        if (!queryOptions?.where(object)) return;
        result.push(object);
      });
    return result
  })


  function getState() {
    return state;
  }

  return { getState, select, selectIndex, upsert, subscribe }
}


function memo<T extends (...args: any[]) => any>(func: T): T {
  const cache: { [key: string]: ReturnType<T> } = {};

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    const result = func(...args);

    if (cache[key]) {
      if (JSON.stringify(cache[key]) === JSON.stringify(result)) return cache[key];
      cache[key] = result;
      return result;
    }

    cache[key] = result;
    return result;
  } as T;
}
