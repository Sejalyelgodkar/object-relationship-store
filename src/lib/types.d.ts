import { createStore } from "./createStore";

export namespace ORS {

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
    indexes: I[]
  }

  export type Replace<T, K extends keyof T, U> = Omit<T, K> & { [P in K]?: U };

  export type Store<N extends string, I extends string, O extends string> = ReturnType<typeof createStore<N, I, O>>

}
