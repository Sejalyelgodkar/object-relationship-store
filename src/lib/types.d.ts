import { createStore } from "./createStore";

export namespace ORS {

  export interface Model<N extends string = string> {
    [name: N]: RelationalObject<N>;
  }

  export interface RelationalObject<N extends string = string> {
    [field: string]: Primitive | "hasOne" | "hasMany";
    __name: N;
    __primaryKey: string;
    __relationship: Record<string, Has<N>>;
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


  export type Primitive = "string" | "number" | "boolean" | "bigint";

  export type Schema = Record<string, Primitive>

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

  export interface UpsertOptions<I extends string> {
    indexes: { index: I, key: string }[];
  }

  export type Replace<T, K extends keyof T, U> = Omit<T, K> & { [P in K]?: U };

  export type Store<N extends string, I extends string, O extends string> = ReturnType<typeof createStore<N, I, O>>

  export type StoreObject<I> = {

    /**
     * Your object key values pair
     */
    [key: string]: any;

    /**
     * If this object is being inserted into an index and you want to skip it, set this value to true when upserting.
     */
    __skipIndex__?: boolean;

    /**
     * If this object cannot be identified by the identifier, set this value.
     */
    __identify__?: I;

    /**
     * If you want to remove this object and all references to it in the store,
     * set this value to true when upserting
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

}
