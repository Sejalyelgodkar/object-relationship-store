declare function createStore<N extends string, I extends string, O extends string>(config: ORS.CreateStoreConfig<N, I, O>): {
    save: (callback: (store: ORS.RestoreStore) => void) => void;
    restore: (store: ORS.RestoreStore) => void;
    getState: () => ORS.State;
    getReferences: () => {
        [key: string]: {
            [primaryKey: string]: `${string}.${string}.${string}`[];
        };
    };
    purge: () => void;
    select: <N_1 extends string, O_1 extends Record<string, any>>(options: ORS.SelectOptions<N_1, O_1>) => O_1 | O_1[] | null;
    selectIndex: <E extends I, N_2 extends string, O_2 extends Record<string, any>>(index: `${E}-${string}`, options?: Record<string, ORS.Replace<ORS.SelectOptions<N_2, O_2>, "where", (object: any) => boolean>> | undefined) => O_2[] | null;
    upsert: (object: ORS.StoreObject<N, I> | ORS.StoreObject<N, I>[]) => void;
    subscribe: (listener: () => void) => () => boolean;
    destroy: (name: N | `${I}-${string}`) => void;
};

declare namespace ORS {

  export interface Model<N extends string = string> {
    [name: N]: RelationalObject<N>;
  }

  export interface RelationalObject<N extends string = string> {
    [field: string]: Has<N>;
    __name: N;
    __primaryKey: string;
    __relationship: Record<string, Has<N>>;
    __indexes: string[];
  }

  export interface RelationalCreator<N extends string = string> extends RelationalObject<N> {
    hasOne: (object: RelationalObject, as?: string) => RelationalObject;
    hasMany: (object: RelationalObject, as?: string) => RelationalObject;
  }

  export type IndexedObject = { name: string; primaryKey: string, primaryKeyValue: any }

  export type Index = { index: string[]; objects: { [key: string]: IndexedObject } }

  export interface RelationalObjectIndex<I extends string, O extends string> {
    __name: I;
    __objects: O[];
    __sort: ((a: any, b: any) => 1 | -1 | 0) | null;
  }


  export interface Has<N extends string> {
    __name: N;
    __primaryKey: string;
    __has: "hasOne" | "hasMany";
    __alias: string;
  }

  export type IdentifierFunction<T> = (object: T) => boolean;

  export interface CreateStoreConfig<N extends string = string, I extends string = string, O extends string = string> {
    relationalCreators: RelationalCreator<N>[];
    indexes?: RelationalObjectIndex<I, O>[];

    /**
     * Identifies the object by testing it against the indetifier functions.
     * Optionally, you can also add the key \_\_identify\_\_ in the object, with the value as the name of the object and it will use that as
     * an alternative to the identifier.
     * Using \_\_identify\_\_ is faster.
     * 
     * const post = {id: 1, content: "Hello World", \_\_identify\_\_: "post"}
     * 
     */
    identifier: { [K in N]: IdentifierFunction<any>; }

    initialStore?: ORS.RestoreStore
  }

  export interface State {
    [key: string]: Record<string, any>
  }

  export type Where<O> = ((object: O) => boolean) | Partial<O>

  export interface SelectOptions<
    N extends string,
    O extends Record<string, any>
  > {
    from: N;
    where: Where<O> | Where<O>[] | "*";
    fields: (keyof O)[] | "*";
    join?: JoinOptions<keyof O>[];
  }

  export type SelectorFunction<
    N extends string,
    O extends Record<string, any>
  > = (model: Model<N>, state: State) => any;

  export interface JoinOptions<K extends string | number | symbol> {
    on: K | ({} & string);
    fields: string[] | "*";
    join?: JoinOptions<K>[];
  }

  export type Replace<T, K extends keyof T, U> = Omit<T, K> & { [P in K]?: U };

  export type Store<N extends string, I extends string, O extends string> = ReturnType<typeof createStore<N, I, O>>

  export type StoreObject<N, I> = {

    /**
     * Your object key values pair
     */
    [key: string]: any;

    /**
     * The indexes this object belongs to
     */
    __indexes__?: `${I}-${string}`[];

    /**
     * If this object cannot be identified by the identifier, set this value.
     */
    __identify__?: N;

    /**
     * If you want to remove this object and all references to it in the store,
     * set this value to true when upserting
     * 
     * The object, all references and all other objects that referenced only this object (orphaned children) will be destroyed.
     */
    __destroy__?: boolean;
  }


  type Ref = `${string}.${string}.${string}`;

  export interface ReferenceStore {
    current: {
      [key: string]: {
        [primaryKey: string]: Ref[]
      }
    },
    upsert: (
      this: ReferenceStore,
      val: {
        name: string;
        primaryKey: string | number;
        ref: Ref
      }
    ) => void
  }


  export interface RestoreStore {
    state: ORS.State;
    references: ORS.ReferenceStore["current"];
  }
}

/**
 * @param primaryKey Default is "id", otherwise specify what the primary key of the object is.
 */
declare function createRelationalObject<N extends string>(name: N, primaryKey?: string): ORS.RelationalCreator<N>;

/**
 * Creates an object index.
 * For example, if you upsert an array of articles, and you created an index of articles to handle pagination,
 * When you upsert and mention the article index, the index will get updated.
 */
declare function createRelationalObjectIndex<N extends string, I extends string>(name: I, objects: ORS.RelationalCreator<N>[], sort?: (a: any, b: any) => 1 | -1 | 0): ORS.RelationalObjectIndex<I, N>;

declare function withOptions<N extends string, I extends string>(object: ORS.StoreObject<N, I>, options: {
    [K in keyof ORS.StoreObject<N, I>]?: ORS.StoreObject<N, I>[K] | ((object: ORS.StoreObject<N, I>) => ORS.StoreObject<N, I>[K]);
}): ORS.StoreObject<N, I> | ORS.StoreObject<N, I>[];

export { ORS, createRelationalObject, createRelationalObjectIndex, createStore, withOptions };
