interface RelationalObject<N extends string = string> {
  [field: symbol]: Primitive | "hasOne" | "hasMany";
  __name: N;
  __primaryKey: string;
  __relationship: Record<string, Has<N>>;
}

interface RelationalCreator<N extends string = string> extends RelationalObject<N> {
  hasOne: (object: RelationalObject, as?: string) => RelationalObject;
  hasMany: (object: RelationalObject, as?: string) => RelationalObject;
}

interface RelationalObjectIndex<I extends string, O extends string> {
  __name: I;
  __objects: O[];
}


type Primitive = "string" | "number" | "boolean" | "bigint";

type Schema = Record<string, Primitive>

interface Has<N extends string> {
  __name: N;
  __primaryKey: string;
  __has: "hasOne" | "hasMany";
  __alias: string;
}

type IdentifierFunction<T> = (object: T) => boolean;

interface CreateStoreConfig<N extends string = string, I extends string = string, O extends string = string> {
  relationalCreators: RelationalCreator<N>[];
  indexes?: RelationalObjectIndex<I, O>[];
  identifier: { [K in N]: IdentifierFunction<any>; }
}

interface State {
  [key: string]: Record<string, any>
}

type Where<O> = ((object: O) => boolean) | Partial<O>

interface SelectOptions<
  N extends string,
  O extends Record<string, any>
> {
  from: N;
  where: Where<O> | Where<O>[] | "*";
  fields: (keyof O)[] | "*";
  join?: JoinOptions<any>[];
}

interface JoinOptions<
  O extends Record<string, any>
> {
  on: string;
  fields: (keyof O)[] | "*";
  join?: JoinOptions<any>[];
}

interface UpsertOptions<I extends string> {
  indexes: I[]
}

type Replace<T, K extends keyof T, U> = Omit<T, K> & { [P in K]?: U };

declare function createRelationalObject<N extends string>(name: N, schema: Schema, options?: {
    primaryKey?: string;
}): RelationalCreator<N>;

declare function createRelationalObjectIndex<N extends string, I extends string>(name: I, objects: RelationalCreator<N>[]): RelationalObjectIndex<I, N>;

declare function createStore<N extends string, I extends string, O extends string>(config: CreateStoreConfig<N, I, O>): {
    state: State;
    select: <N_1 extends string, O_1 extends Record<string, any>>(options: SelectOptions<N_1, O_1>) => O_1 | O_1[] | null;
    selectIndex: <E extends I, N_2 extends string, T extends Record<string, any>>(index: E, options: {
        [name: string]: Replace<SelectOptions<N_2, T>, "where", (object: any) => boolean>;
    }) => Record<string, any>[];
    upsert: (object: any, options?: UpsertOptions<I>) => void;
    subscribe: (listener: () => void) => () => boolean;
};

export { createRelationalObject, createRelationalObjectIndex, createStore };
