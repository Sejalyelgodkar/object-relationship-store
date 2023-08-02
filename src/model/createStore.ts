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
      const k = next.__relationship[next.__primaryKey]?.__name ?? next.__primaryKey;
      if (!(next as any)[k]) throw new Error(`The table "${next.__name}" does not have a primary key (pk) "${t.__primaryKey}", pk should be listed here ${JSON.stringify(t)}`);
      return { ...r, [next.__name]: next }
    }, {} as Model<N>)


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


  function upsert(object: any) {
    
    const items = Array.isArray(object) ? object : [object];


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
      relationalObject: RelationalObject;
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

      // If this table does not exist, initialize it.
      if (!state[name]) state[name] = {};

      // If the record does not exist, create an empty obj
      if (!state[name][item[primaryKey]]) state[name][item[primaryKey]] = {};


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


    listeners.forEach(listener => listener());
  }


  function select() {
    return state
  }

  return { state, upsert, subscribe }
}

