
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

export type Primitive = "string" | "number" | "boolean" | "bigint";

export type Schema = Record<string, Primitive>

export interface Has<N extends string> {
  __name: N;
  __primaryKey: string;
  __has: "hasOne" | "hasMany";
  __alias: string;
}

type IdentifierFunction<T> = (object: T) => boolean;

export interface CreateStoreConfig<N extends string = string> {
  relationalCreators: RelationalCreator<N>[];
  identifier: { [K in N]: IdentifierFunction<any>; }
}

export interface State {
  [key: string]: Record<string, any>
}