export class ArrayUtil {
  /**
   * toHashMap converts given array of object to hash map [key, value] =  [input key, object with that key]
   *
   * @param items Ex: [{id: 1, name: "Jack"}, {id: 2, name: "Sam"}]
   * @param getKey Ex: (item) => item.id
   * @returns Ex: {1: {id: 1, name: "Jack"}, 2: {id: 2, name: "Sam"}}
   */
  public static toHashMap<ValueType, KeyType extends string | number = string>(
    items: ValueType[],
    getKey: (item: ValueType) => KeyType,
  ): Record<KeyType, ValueType> {
    return items.reduce((acc, item) => {
      acc[getKey(item)] = item;

      return acc;
    }, {} as Record<KeyType, ValueType>);
  }

  /**
   * toHashMapArrays converts given array of object to hash map [key, value] =  [input key, array of objects with that key]
   *
   * @param items Ex: [{id: 1, name: "Jack"}, {id: 2, name: "Jack"}, {id: 3, name: "Sam"}]
   * @param getKey Ex: (item) => item.name
   * @returns Ex: {"Jack": [{id: 1, name: "Jack"}, {id: 2, name: "Jack"}], "Sam": [{id: 3, name: "Sam"}]}
   */
  public static toHashMapArrays<
    ValueType,
    KeyType extends string | number = string,
  >(
    items: ValueType[],
    getKey: (item: ValueType) => KeyType,
  ): Record<KeyType, ValueType[]> {
    return items.reduce((acc, item) => {
      const key = getKey(item);
      if (key in acc) {
        acc[key].push(item);
      } else {
        acc[key] = [item];
      }

      return acc;
    }, {} as Record<KeyType, ValueType[]>);
  }
}
