declare function createStore<N extends string, I extends string, O extends string>(config: ORS.CreateStoreConfig<N, I, O>): {
    getState: () => ORS.State;
    purge: () => void;
    select: <N_1 extends string, O_1 extends Record<string, any>>(options: ORS.SelectOptions<N_1, O_1>) => O_1 | O_1[] | null;
    selectIndex: <E extends I, N_2 extends string, O_2 extends Record<string, any>>(index: `${E}-${string}`, options?: Record<string, ORS.Replace<ORS.SelectOptions<N_2, O_2>, "where", (object: any) => boolean>> | undefined) => O_2[] | null;
    upsert: (object: any, options?: ORS.UpsertOptions<I>) => void;
    subscribe: (listener: () => void) => () => boolean;
};

declare namespace ORS {

  export interface Model<N extends string = string> {
    [name: N]: RelationalObject<N>;
  }

  export interface RelationalObject<N extends string = string> {
    [field: symbol]: Primitive | "hasOne" | "hasMany";
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
     * Optionally, you can also add the key __identify__ in the object, with the value as the name of the object and it will use that as
     * an alternative to the identifier.
     * Using __identify__ is faster.
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
    join?: JoinOptions<any>[];
  }

  export type SelectorFunction<
    N extends string,
    O extends Record<string, any>
  > = (model: Model<N>, state: State) => any;

  export interface JoinOptions<
    O extends Record<string, any>
  > {
    on: string;
    fields: (keyof O)[] | "*";
    join?: JoinOptions<any>[];
  }

  export interface UpsertOptions<I extends string> {
    indexes: { index: I, key: string }[];
  }

  export type Replace<T, K extends keyof T, U> = Omit<T, K> & { [P in K]?: U };

  export type Store<N extends string, I extends string, O extends string> = ReturnType<typeof createStore<N, I, O>>

}

declare function createRelationalObject<N extends string>(name: N, schema: ORS.Schema, options?: {
    primaryKey?: string;
}): ORS.RelationalCreator<N>;

declare function createRelationalObjectIndex<N extends string, I extends string>(name: I, objects: ORS.RelationalCreator<N>[], sort?: (a: any, b: any) => 1 | -1 | 0): ORS.RelationalObjectIndex<I, N>;

export { ORS, createRelationalObject, createRelationalObjectIndex, createStore };
