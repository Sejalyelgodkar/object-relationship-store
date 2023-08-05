import { RelationalCreator, RelationalObjectIndex } from "../types";

export function createRelationalObjectIndex<
  N extends string,
  I extends string
>(
  name: I,
  objects: RelationalCreator<N>[]
) {

  const object = {
    __name: name,
    __objects: objects.map(o => o.__name),
  }

  return object as unknown as RelationalObjectIndex<I, RelationalCreator<N>["__name"]>
}