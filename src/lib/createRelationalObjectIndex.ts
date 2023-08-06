import { type ORS } from "./types";

export function createRelationalObjectIndex<
  N extends string,
  I extends string
>(
  name: I,
  objects: ORS.RelationalCreator<N>[]
) {

  const object = {
    __name: name,
    __objects: objects.map(o => o.__name),
  }

  return object as unknown as ORS.RelationalObjectIndex<I, ORS.RelationalCreator<N>["__name"]>
}