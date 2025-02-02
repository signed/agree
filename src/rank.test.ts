import { expect, test } from 'vitest'
import { asRank, rankComparator } from './rank.ts'

test('sort ranks ascending', () => {
  const sorted = [asRank(3), asRank(1), asRank(22), asRank(2)].sort(rankComparator)
  expect(sorted).toEqual([1, 2, 3, 22])
})

test('sort not picked below actual ranks', () => {
  expect([asRank(43), 'not picked' as const, asRank(2)].sort(rankComparator)).toEqual([2, 43, 'not picked'])
})

export type Comparator<T> = (a: T, b: T) => number
const reverse =
  <T>(comparator: Comparator<T>): Comparator<T> =>
  (a: T, b: T) =>
    comparator(a, b) * -1

test('reverse sort order', () => {
  const sorted = [1, 2, 3].map(asRank).sort(reverse(rankComparator))
  expect(sorted).toEqual([3, 2, 1])
})
