import { type ORS } from "./types";
import querySelect from "./query/select";
import { deepCopy, memo } from "./utils";
import withOptions from "./helper/withOptions";

export function createStore<
  N extends string,
  I extends string,
  O extends string,
>(config: ORS.CreateStoreConfig<N, I, O>) {

  const {
    relationalCreators,
    indexes,
    identifier,
    initialStore,
  } = config;


  const references: ORS.ReferenceStore = {
    current: initialStore?.references ?? {},
    upsert(this, val) {
      if (!this.current[val.name]) this.current[val.name] = {}
      if (!this.current[val.name][val.primaryKey]) {
        this.current[val.name][val.primaryKey] = [val.ref];
        return;
      }
      if (this.current[val.name][val.primaryKey].includes(val.ref)) return;
      this.current[val.name][val.primaryKey].push(val.ref)
    },
    remove(this, val) {
      const { name, primaryKey, ref } = val;
      this.current[name][primaryKey] = this.current[name][primaryKey].filter(r => r !== ref)
    }
  };

  const state = initialStore?.state ?? {} as ORS.State;


  const listeners = new Set<() => void>();


  const model = relationalCreators
    .reduce((r, t) => {
      const { hasOne, hasMany, ...next } = t
      return { ...r, [next.__name]: next }
    }, {} as ORS.Model<N>)


  // @ts-ignore
  indexes?.forEach(index => model[index.__name] = index)


  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }


  /**
   * Identifies the object by testing it against the indetifier functions.
   * Optionally, you can also add the key \_\_identify\_\_ with the value as the name of the object and it will use that as
   * an alternative to the identifier
   * @param item The object we want to indentify
   * @returns The name of the object
   */
  function identify(item: any): string {
    if ("__identify__" in item) {
      const name = item.__identify__;
      delete item.__identify__;
      return name;
    }
    for (const key in identifier) {
      if (!Object.prototype.hasOwnProperty.call(identifier, key)) continue;
      const validator = identifier[key];
      if (validator(item)) return key;
    }
    throw new Error(`Identifier was not able to identify this object ${JSON.stringify(item)}`);
  }


  function upsert(object: ORS.StoreObject<N, I> | ORS.StoreObject<N, I>[]) {

    const items = deepCopy(Array.isArray(object) ? object : [object]);

    // The key __indexes__ will be deleted after it's used so we need to 
    // get all the indexes before any operations
    const indexes =
      items
        .reduce((acc, cur) => {
          if (typeof cur.__indexes__ === "string") {
            acc.push(cur.__indexes__.split("-") as [string, string]);
            return acc;
          }
          if (cur.__indexes__) {
            const uids = cur.__indexes__.map((i) => i.split("-") as [string, string]);
            acc.push(...uids);
          }
          return acc;
        }, [] as [string, string][])


    function destroyOrphans(params: {
      item: ORS.StoreObject<N, I>;
      name: string;
      primaryKey: string;
    }) {
      const {
        item,
        name,
        primaryKey,
      } = params;


      // @ts-ignore
      const itemSchema: ORS.RelationalObject<N> = model[name];

      /**
       * For each related field in this object, check if the objects related fields and remove orphan children.
       */
      Object
        .entries(itemSchema.__relationship)
        .forEach(([field, relationship]) => {
          if (!state[name][item[primaryKey]]) return;

          const itemPrimaryKey = state[name][item[primaryKey]][field];

          // If there is no primary key, skip
          if (!itemPrimaryKey) return;

          // This field in the object is a "hasMany", loop over itemPrimaryKey, it is an array of primary keys.
          if (relationship.__has === "hasMany") {
            itemPrimaryKey
              .forEach((pk: any) => {
                const refs = references.current[relationship.__name][pk];

                // For each pk, check if all are self refs
                const allSelfRef = refs.every(ref => {
                  const [refName, refPrimaryKey] = ref.split(".")
                  return refName === name && refPrimaryKey === String(item[primaryKey])
                })

                if (!allSelfRef) return;

                // If we are going to destroy this related object, check it for orphaned children and remove them too.
                // recursively

                destroyOrphans({
                  item: { [relationship.__primaryKey]: pk },
                  name: relationship.__name,
                  primaryKey: relationship.__primaryKey
                })

                // Finally,
                // If all references are to the item we are deleting, remove all refs and delete the object too
                delete references.current[relationship.__name][pk];
                delete state[relationship.__name][pk];
              });

            return;
          }

          const refs = references.current[relationship.__name][itemPrimaryKey];

          // If we have references
          if (refs) {

            // Check if all are self refs
            const allSelfRef = refs.every(ref => {
              const [refName, refPrimaryKey] = ref.split(".")
              return refName === name && refPrimaryKey === String(item[primaryKey])
            })

            if (!allSelfRef) return;


            // If we are going to destroy this related object, check it for orphaned children and remove them too.
            // recursively
            destroyOrphans({
              item: { [relationship.__primaryKey]: itemPrimaryKey },
              name: relationship.__name,
              primaryKey: relationship.__primaryKey
            })

            // If all references are to the item we are deleting, remove all refs and delete the object too
            delete references.current[relationship.__name][itemPrimaryKey];
            delete state[relationship.__name][itemPrimaryKey];
          }
        })

      // Lastly, delete the object
      // We have already destroyed all orphans.
      delete state[name][item[primaryKey]];

      // Delete the item from any index it is referenced in.
      itemSchema
        .__indexes
        .forEach(indexName => {
          const index = (state[indexName] as ORS.Index);
          const objectKey: ORS.Index[number] = `${name}-${item[primaryKey]}`;
          const i = index.indexOf(objectKey);
          if (i !== -1) index.splice(i, 1);
        })
    }


    function destroyReferences(params: {
      item: ORS.StoreObject<N, I>;
      name: string;
      primaryKey: string;
    }) {

      const {
        item,
        name,
        primaryKey,
      } = params;

      if (!state[name]) return;

      /**
       * If there are no references, destroy the object and orphans
       */
      if (!references.current[name]) {
        destroyOrphans({ item, name, primaryKey });
        return;
      }

      const itemPrimaryKey = item[primaryKey];
      const refs = references.current[name][itemPrimaryKey];

      if (refs) {
        refs
          .forEach(ref => {

            //  ["user", "10", "images"] = ref.split(".")
            const [refName, refPrimaryKey, refField] = ref.split(".")

            // If this object was destroyed earlier,
            // can happen when deleting multiple items at once
            if (!state[refName][refPrimaryKey]) return;

            // @ts-ignore
            const refRelation: ORS.RelationalObject<N> = model[refName];

            const hasMany = refRelation.__relationship[refField].__has === "hasMany";

            // If this field is not a has many, delete it.
            if (!hasMany) {
              delete state[refName][refPrimaryKey][refField];
              return;
            }

            const index = state[refName][refPrimaryKey][refField].indexOf(itemPrimaryKey);
            if (index !== -1) {
              if (state[refName][refPrimaryKey][refField].length === 1) {
                delete state[refName][refPrimaryKey][refField];
                return;
              }
              state[refName][refPrimaryKey][refField].splice(index, 1);
            }
          })

        delete references.current[name][itemPrimaryKey];
      }

      /**
       * If there were references, after removing them, destroy the object and all orphans
       */
      destroyOrphans({ item, name, primaryKey });
    }


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
      item: ORS.StoreObject<N, I>;
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
          references.upsert({ name: relationWithParent.__name, primaryKey: parentPrimaryKey, ref: `${name}.${item[primaryKey]}.${relationWithParent.__alias}` });
          state[name][item[primaryKey]][relationWithParent.__alias] = parentPrimaryKey;
        }

        if (relationWithParent.__has === "hasMany") {
          const existingItems = state[name][item[primaryKey]][relationWithParent.__alias];
          const isAnArray = Array.isArray(existingItems);

          // If the existing items is not an array, it's new, assign it to a
          // new array containg the current item.
          if (!isAnArray) {
            references.upsert({ name: relationWithParent.__name, primaryKey: parentPrimaryKey, ref: `${name}.${item[primaryKey]}.${relationWithParent.__alias}` });
            state[name][item[primaryKey]][relationWithParent.__alias] = [parentPrimaryKey];
            return;
          }

          // The existing items is an array
          // Check if the current item exists. If it does not, add it.
          const exists = !!existingItems.find((id: any) => id === parentPrimaryKey);
          if (!exists) {
            references.upsert({ name: relationWithParent.__name, primaryKey: parentPrimaryKey, ref: `${name}.${item[primaryKey]}.${relationWithParent.__alias}` });
            existingItems.push(parentPrimaryKey);
          }
        }
      }

    }


    /**
     * Upserts a single item. Calls itself recursively based on object relationship.
     */
    function upsertOne(params: {
      item: ORS.StoreObject<N, I>;
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
      const relationalObject: ORS.RelationalObject<N> = model[name];

      const primaryKey = relationalObject.__primaryKey;

      // If the primary key does not exist on the object, we can't go forward.
      if (!item[primaryKey]) throw new Error(`Expected object "${name}" to have a primaryKey "${primaryKey}".`);

      if ("__destroy__" in item) {
        // If we are destroying this item and all references, call destroyReferences and return
        if (item.__destroy__) return destroyReferences({ item, name, primaryKey });
        delete item.__destroy__;
      }

      // If this table does not exist, initialize it.
      if (!state[name]) state[name] = {};

      // If the record does not exist, create an empty obj
      if (!state[name][item[primaryKey]]) state[name][item[primaryKey]] = {};


      // Do not update indexes if we are inside an object,
      // If we receive posts[], update indexes, if post has a user, we traverse inside, do not update indexes for user or any children of post.
      if (!parentName) {

        // If this item is indexed, add it to the index. The index is a set.
        if ("__indexes__" in item) {
          const __indexes__ = typeof item.__indexes__ === "string" ? [item.__indexes__] : item.__indexes__;
          __indexes__
            ?.forEach((indexKey) => {

              const [indexName] = indexKey.split("-")

              // @ts-ignore
              const indexModel = model[indexName] as ORS.RelationalObjectIndex<I, O>

              // If this object does not have an index, skip it.
              if (!indexModel?.__objects.includes(name as O)) return;

              // If the model's index does not include this, add it.
              if (!relationalObject.__indexes.includes(indexKey)) relationalObject.__indexes.push(indexKey)

              // If it's not defined in state, initialize it.
              if (!state[indexKey]) (state[indexKey] as ORS.Index) = [];

              // If the key already exists in the index, skip it.
              const objKey: ORS.Index[number] = `${name}-${item[primaryKey]}`;
              if (!!(state[indexKey] as ORS.Index).includes(objKey)) return;

              (state[indexKey] as ORS.Index).push(objKey);
            })

          delete item.__indexes__;
        }

        if ("__removeFromIndexes__" in item) {
          const __removeFromIndexes__ = typeof item.__removeFromIndexes__ === "string" ? [item.__removeFromIndexes__] : item.__removeFromIndexes__;

          __removeFromIndexes__
            ?.forEach((indexKey) => {

              if (!state[indexKey]) return;

              const objKey: ORS.Index[number] = `${name}-${item[primaryKey]}`;
              const currentIndex = state[indexKey] as ORS.Index;
              const selectedIndex = currentIndex.indexOf(objKey);
              if (selectedIndex > -1) state[indexKey].splice(selectedIndex, 1);
            })

          delete item.__removeFromIndexes__;
        }
      }


      /**
       * Traverse inside the object and add all related fields to state.
       */
      Object
        .entries(item)
        .forEach(([field, value]: any) => {

          // If this field is a related field, traverse in recursively
          if (!!relationalObject.__relationship[field]) {

            const hasMany = relationalObject.__relationship[field].__has === "hasMany";

            if (!item[field]) return;

            if (!hasMany) {

              // hasOne and the item is a foreign key
              if(typeof item[field] !== "object") {
                state[name][item[primaryKey]][field] = item[field];
                return;
              }

              upsertOne({
                item: item[field],
                parentPrimaryKey: item[primaryKey],
                parentField: field,
                parentName: name,
              })
              return;
            }

            // hasMany and all the items are foreignKeys
            if (item[field].every((i: any) => typeof i !== "object")) {
              const relationName = relationalObject.__relationship[field].__name;
              const itemPrimaryKey = item[primaryKey];
              const items = state[name][itemPrimaryKey][field];
              const next = [];
              for (let i = 0; i < items?.length; i++) {
                const pk = items[i];
                if (!item[field].includes(pk)) {
                  references.remove({ name: relationName, primaryKey: pk, ref: `${name}.${itemPrimaryKey}.${field}` });
                  continue;
                }
                next.push(pk)
              }
              state[name][itemPrimaryKey][field] = next;
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


      /**
       * If this object is a child of someone, create a reference by primaryKey in the parent
       */
      if (parentName && parentField && parentPrimaryKey) {

        if (parentFieldHasMany) {
          const existingItems = state[parentName][parentPrimaryKey][parentField];

          // If the existing items is not an array, it's new, assign it to a
          // new array containg the current item.
          if (!Array.isArray(existingItems)) {
            references.upsert({ name, primaryKey: item[primaryKey], ref: `${parentName}.${parentPrimaryKey}.${parentField}` });
            state[parentName][parentPrimaryKey][parentField] = [item[primaryKey]];
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
          const exists = !!existingItems.find((id: any) => id === item[primaryKey]);
          if (!exists) {
            references.upsert({ name, primaryKey: item[primaryKey], ref: `${parentName}.${parentPrimaryKey}.${parentField}` });
            existingItems.push(item[primaryKey])
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


        references.upsert({ name, primaryKey: item[primaryKey], ref: `${parentName}.${parentPrimaryKey}.${parentField}` });

        // The child has been created
        // set the parent field to the reference of this object
        state[parentName][parentPrimaryKey][parentField] = item[primaryKey];

        handleChildRelationshipWithParent({
          name,
          item,
          parentName,
          parentPrimaryKey,
          primaryKey,
          relationalObject
        })
      }

    }


    items.forEach(item => !!item && upsertOne({ item }))


    indexes
      ?.forEach(([indexName, indexUid]) => {
        // @ts-ignore
        const sort = (model[indexName] as ORS.RelationalObjectIndex<I, O>).__sort;
        const indexKey = `${indexName}-${indexUid}`;
        if (!sort || !state[indexKey]) return;
        (state[indexKey] as ORS.Index)
          .sort((a, b) => {
            const [aName, aPk] = a.split("-")
            const [bName, bPk] = b.split("-")
            return sort(state[aName][aPk], state[bName][bPk])
          })
      })


    listeners.forEach(listener => listener());
  }

  function upsertWhere<
    N extends string,
    O extends Record<string, any>
  >(options: ORS.SelectOptions<N, O>, callback: (current: Partial<O> | null) => Partial<O> | null) {
    const current = select(options) as O | null;
    const next = callback(current) as O | O[] | null;
    if (!next) return;
    if (Array.isArray(next)) return upsert(withOptions<any, any>(next, { __identify__: options.from }));
    if (!current) return upsert({ ...next, __identify__: options.from });
    upsert({ ...current, ...next, __identify__: options.from });
  }

  const select = memo(<
    N extends string,
    O extends Record<string, any>
  >(options: ORS.SelectOptions<N, O>): O | O[] | null => {
    return querySelect<N, O>(model, state, options);
  })


  /**
   * @param index The name of the index you want to select from
   * @param options The key is the name of the object, value is SelectOptions
   */
  const selectIndex = memo(<
    E extends I,
    N extends string,
    O extends Record<string, any>
  >(index: `${E}-${string}`, options?: Record<string, ORS.Replace<ORS.SelectOptions<N, O>, "where", ((object: any) => boolean)>>) => {
    const indexes = state[index] as ORS.Index;
    const result: O[] = [];
    if (!indexes) return null;
    indexes
      .forEach((objectKey) => {
        const [objectName, objectPk] = objectKey.split("-");
        // @ts-ignore
        const { __primaryKey } = model[objectName] as ORS.RelationalObject<N>;
        const queryOptions = options ? options[objectName] : { from: objectName, fields: "*" } as ORS.Replace<ORS.SelectOptions<N, O>, "where", ((object: any) => boolean)>;

        if (!queryOptions) throw new Error(`selectIndex() expected SelectOptions for "${objectName}" in the index "${index}".`);

        const object = querySelect(model, state, { ...queryOptions, where: { [__primaryKey]: objectPk } } as ORS.SelectOptions<any, any>);
        if (!object) return;
        if (!queryOptions?.where) return result.push(object);
        if (typeof queryOptions?.where === "function" && !queryOptions?.where(object)) return;
        result.push(object);
      });
    return result
  })


  function getState() { return state; }

  function getReferences() { return references.current; }

  function purge() {
    for (const key in state) {
      if (!Object.prototype.hasOwnProperty.call(state, key)) return;
      delete state[key];
    };
    references.current = {};
  }

  function destroy(name: N | `${I}-${string}`) {
    delete state[name];
  }

  function save(callback: (store: ORS.RestoreStore) => void) {
    callback({ state, references: references.current })
  }


  function restore(store: ORS.RestoreStore) {
    references.current = store.references;
    Object
      .entries(store.state)
      .map(([key, value]) => state[key] = value)
  }

  return {
    save,
    restore,
    getState,
    getReferences,
    purge,
    select,
    selectIndex,
    upsert,
    upsertWhere,
    subscribe,
    destroy
  }
}