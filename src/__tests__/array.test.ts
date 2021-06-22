import { arrayUtils } from '../array';

test('removeItem', () => {
    const array = ['a', 'b', 'c', 'd']
    arrayUtils.removeItem(array, 'b')
    expect(array).toEqual(['a', 'c', 'd']);
});
//
// test('removeItemByIndex', () => {
//     expect(Greeter('Carl')).toBe('Hello Carl');
// });
