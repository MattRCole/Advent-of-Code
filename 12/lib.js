
/**
 * @typedef {{ permutations: number, checkSumCount: number }} PermutationInfo
 * @typedef {{ checkSums: number[], groups: string[][], permutations: number }} Case
 */

/** @type {(checkSum: number, group: string[]) => boolean} */
const checkSumFitsAtStart = (checkSum, group) => {
  if (checkSum > group.length) return false

  if (checkSum === group.length) return true

  if (group[checkSum] === '?') return true

  return false
}

/** @type {(group: string[], checkSums: number[]) => PermutationInfo[]} */
const findAllGroupPermutation = (group, checkSums) => {
  /** @type {number[][]} */
  const allValidEndingPoints = []
  /** @type {{ [key: number]: number }} */
  const allPotentialEndingPoints = []
  for (let i = 0; i < checkSums.length; i++) {
    const checkSum = checkSums[i]
    const startingPoints = i === 0 ? [0] : allPotentialEndingPoints[i - 1]
    const potentialEndingPoints = []

    const validEndingPoints = []


    for (const startingPoint of startingPoints) {
      if (startingPoint >= group.length) continue

      let offset = -1


      do {
        offset++

        const currentGroup = group.slice(startingPoint + offset)

        if (checkSumFitsAtStart(checkSum, currentGroup) === false) continue

        const endingPoint = startingPoint + offset + checkSum + 1

        potentialEndingPoints.push(endingPoint)//  = (potentialEndingPoints[endingPoint] || 0) + permutationModifier

        if (group.slice(endingPoint).includes('#') === false) {
          validEndingPoints.push(endingPoint)
        }
      } while (startingPoint + offset < group.length && group[startingPoint + offset] !== '#')

    }

    allPotentialEndingPoints.push(potentialEndingPoints)
    allValidEndingPoints.push(validEndingPoints)
  }

  const toReturn = allValidEndingPoints.map(
    ({ length }, index) => ({ checkSumCount: index + 1, permutations: length })
  ).filter(({ permutations }) => permutations)

  if (group.includes('#') === false) {
    toReturn.push({ checkSumCount: 0, permutations: 1 })
  }

  return toReturn
}

/**
 * returns an array of cases to queue
 * @param {PermutationInfo[]} permutationInfo 
 * @param {string[][]} groups all remaining groups including the one that was just consumed
 * @param {number[]} checkSums all remaining checkSums
 * @param {number} currentPermutations How many permutations exist so far
 * 
 * @returns {Case[]}
 */
const getCaseQueue = (permutationInfo, groups, checkSums, currentPermutations) => {
  const newGroups = groups.slice(1)

  /** @type {Case[]} */
  const cases = permutationInfo.map(({ checkSumCount, permutations }) => {
    const newCheckSums = checkSums.slice(checkSumCount)


    /** @type {Case} */
    const newCase = { checkSums: newCheckSums, groups: newGroups, permutations: currentPermutations * permutations }

    return newCase
  })

  return cases
}

/** @type {(baseCase: Case) => number} */
const solveBaseCase = baseCase => {
  let queue = [baseCase]
  let totalPermutations = 0
  while (queue.length) {
    const { groups, checkSums, permutations } = queue.pop()

    const onlyEmptyGroups = groups.map(g => g.join('')).join('').includes('#') === false
    if (onlyEmptyGroups && checkSums.length === 0) {
      totalPermutations += permutations
      continue
    }

    if (groups.length === 0 || checkSums.length === 0) {
      continue
    }

    const permutationInfo = findAllGroupPermutation(groups[0], checkSums)

    const newCases = getCaseQueue(permutationInfo, groups, checkSums, permutations)

    queue = [...queue, ...newCases]
  }

  return totalPermutations
}

module.exports = {
  findAllGroupPermutation,
  getCaseQueue,
  solveBaseCase,
}
