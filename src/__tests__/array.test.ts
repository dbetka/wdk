import { arrayUtils } from '../array';

describe('removeItem', () => {
  let array = [] as string[];
  beforeEach(() => (array = ['a', 'b', 'c', 'd']));

  test('should remove specific item', () => {
    arrayUtils.removeItem(array, 'b');
    expect(array).toEqual(['a', 'c', 'd']);
  });

  test('should not modify array if item is not included', () => {
    arrayUtils.removeItem(array, undefined);
    arrayUtils.removeItem(array, '1');
    expect(array).toEqual(array);
  });

  test('should return array with removed item', () => {
    const item = arrayUtils.removeItem(array, 'b');
    expect(item).toEqual(['b']);
  });

  test('should return empty array if item not in array', () => {
    const item = arrayUtils.removeItem(array, 'e');
    expect(item).toEqual([]);
  });

});

describe('removeItemByIndex', () => {
    let array = [] as string[];
    beforeEach(() => (array = ['a', 'b', 'c', 'd']));

    test('should remove specific item', () => {

      arrayUtils.removeItemByIndex(array, 1);

      expect(array).toEqual(['a', 'c', 'd']);
    });
  test('should remove specific item with negative index', () => {

    arrayUtils.removeItemByIndex(array, -3);

    expect(array).toEqual(['a', 'c', 'd']);
  });
  test('should not modify array if index is out of length', () => {

    arrayUtils.removeItemByIndex(array, -10);

    expect(array).toEqual(array);
  });

  },
);

