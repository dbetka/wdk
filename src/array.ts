export const arrayUtils = {
  removeItem<T>(array: T[], toRemove: T): T[] {
    const indexToRemove = array.indexOf(toRemove);
    if (indexToRemove !== -1) {
      return array.splice(indexToRemove, 1);
    }
    return []
  },
  removeItemByIndex<T>(array: T[], indexToRemove: number): T[] {
    return array.splice(indexToRemove, 1);
  },
};
