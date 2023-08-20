import { ORS } from "../types";

export default function withOptions<
  N extends string,
  I extends string,
>(
  object: ORS.StoreObject<N, I>,
  options: { [K in keyof ORS.StoreObject<N, I>]?: ORS.StoreObject<N, I>[K] | ((object: ORS.StoreObject<N, I>) => ORS.StoreObject<N, I>[K]) }
) {

  if (Array.isArray(object)) return object.map(o => oneWithOptions(o, options))

  return oneWithOptions(object, options);
}


function oneWithOptions<
  N extends string,
  I extends string,
>(
  object: ORS.StoreObject<N, I>,
  options: { [K in keyof ORS.StoreObject<N, I>]?: ORS.StoreObject<N, I>[K] | ((object: ORS.StoreObject<N, I>) => ORS.StoreObject<N, I>[K]) }
) {

  if (typeof options.__destroy__ === "function")
    object["__destroy__"] = options.__destroy__(object);
  else
    if (options.__destroy__) object["__destroy__"] = options.__destroy__;

  if (typeof options.__identify__ === "function")
    object["__identify__"] = options.__identify__(object);
  else
    if (options.__identify__) object["__identify__"] = options.__identify__;

  if (typeof options.__indexes__ === "function")
    object["__indexes__"] = options.__indexes__(object);
  else
    if (options.__indexes__) object["__indexes__"] = options.__indexes__;

  if (typeof options.__removeFromIndexes__ === "function")
    object["__removeFromIndexes__"] = options.__removeFromIndexes__(object);
  else
    if (options.__removeFromIndexes__) object["__removeFromIndexes__"] = options.__removeFromIndexes__;
  
  return object
}