

export default function findMatch<
  O extends Record<string, any>
>(where: Partial<O>, object: Record<string, any>) {

  // Iterate over all the fields in the where object
  // If anything does not match with object, return false.
  for (const [field, value] of Object.entries(where)) {
    if (object[field] !== value) return false;
  }

  return true;
}