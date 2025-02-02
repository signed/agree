export type Rank = number & { __brand: 'Rank' }
export const asRank = (i: number) => i as Rank
export const rankComparator = (a: Rank | NotPicked, b: Rank | NotPicked) => {
  if (a === 'not picked' && b === 'not picked') {
    return 0
  }
  if (a === 'not picked') {
    return 1
  }
  if (b === 'not picked') {
    return -1
  }
  return a - b
}

export type NotPicked = 'not picked'
