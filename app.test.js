const { getArrayType, mergeObjects } = require('./app');

describe('getArrayType', function () {
  it('should recognize which types are used inside an array', function () {
    expect(getArrayType()).toBe(undefined);
    expect(getArrayType(['a', 'b', 'c'])).toBe('String');
    expect(getArrayType([1, 2, 3])).toBe('Decimal');
    expect(getArrayType(['a', 'b', 3])).toBe('Object');
    expect(getArrayType(['a', 'b', null])).toBe('String');
    expect(getArrayType([])).toBe('Object');
    expect(getArrayType([{}, {}])).toBe('Object');
    expect(getArrayType([[]])).toBe('List (Of Object)');
    expect(
      getArrayType([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toBe('List (Of Decimal)');
    expect(
      getArrayType([
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
      ])
    ).toBe('List (Of String)');
  });
});

describe('mergeObjects', function () {
  it('should combine an array of objects into one object', function () {
    expect(mergeObjects([null])).toBe(undefined);
    expect(mergeObjects([undefined])).toBe(undefined);
    expect(mergeObjects(null)).toBe(undefined);
    expect(mergeObjects()).toBe(undefined);
    expect(mergeObjects([1, 2, 3])).toBe(undefined);
    expect(mergeObjects(['a', 'b', 'c'])).toBe(undefined);
    expect(mergeObjects([1, 'a', null])).toBe(undefined);
    expect(mergeObjects([{ a: 1 }, { b: 'hallo' }])).toEqual({
      a: 1,
      b: 'hallo',
    });
  });
});
