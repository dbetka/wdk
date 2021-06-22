import { arrayUtils } from '../array';

test('removeItem', () => {
  const array = ['a', 'b', 'c', 'd'];
  arrayUtils.removeItem(array, 'b');
  expect(array).toEqual(['a', 'c', 'd']);
});

test('removeItemByIndex', () => {
    const array = [1, 2];
    arrayUtils.removeItemByIndex(array, 1);
    expect(array).toEqual([1]);
});
