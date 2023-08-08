import { type ORS } from "./types";

/**
 * Creates an object index. 
 * For example, if you upsert an array of articles, and you created an index of articles to handle pagination,
 * When you upsert and mention the article index, the index will get updated.
 * In this array of objects, if you want to skip indexing for one particular object,
 * add the property \_\_skipIndex\_\_: true
 * This will make the indexer skip indexing for that object.
 */
export function createRelationalObjectIndex<
  N extends string,
  I extends string
>(
  name: I,
  objects: ORS.RelationalCreator<N>[],
  sort?: (a: any, b: any) => 1 | -1 | 0,
) {

  const object = {
    __name: name,
    __objects: objects.map(o => o.__name),
    __sort: sort ?? null
  }

  return object as unknown as ORS.RelationalObjectIndex<I, ORS.RelationalCreator<N>["__name"]>
}