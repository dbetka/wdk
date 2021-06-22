export const arrayUtils = {
    removeItem <T> (array: T[], toRemove: T): T[] {
        const indexToRemove = array.indexOf(toRemove);
        return array.splice(indexToRemove, 1);
    },
    removeItemByIndex <T> (array: T[], indexToRemove: number): T[] {
        return array.splice(indexToRemove, 1);
    },
};
