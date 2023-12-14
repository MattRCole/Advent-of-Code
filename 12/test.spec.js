const { findAllGroupPermutation, getCaseQueue, solveBaseCase } = require('./lib')
const testBaseCases = require('./test-cases.json')
const testAnswers = require('./verify.json')

describe("#findAllGroupPermutation", () => {
  it("can solve simple cases", () => {
    const group = ['#']
    const checkSums = [1]

    const result = findAllGroupPermutation(group, checkSums)

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        checkSumCount: 1,
        permutations: 1
      })
    ]))
  })

  it("includes the null case", () => {
    const group = ['.']
    const checkSums = [1]

    const result = findAllGroupPermutation(group, checkSums)

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        checkSumCount: 0,
        permutations: 1
      }),
      expect.objectContaining({
        checkSumCount: 1,
        permutations: 1
      })
    ]))
  })

  it("Correctly solves ??? with 1,1,3", () => {
    const checkSums = [1, 1, 3]
    const group = '???'.split('')

    const result = findAllGroupPermutation(group, checkSums)

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        checkSumCount: 0,
        permutations: 1
      }),
      expect.objectContaining({
        checkSumCount: 1,
        permutations: 3
      }),
      expect.objectContaining({
        checkSumCount: 2,
        permutations: 1
      })
    ]))

  })
  it("Correctly solves ### with 1,1,3", () => {
    const checkSums = [1, 1, 3]
    const group = '###'.split('')


    const result = findAllGroupPermutation(group, checkSums)

    expect(result).toEqual(expect.arrayContaining([]))
  })

  it("Correctly solves ?###???????? with 3,2,1", () => {
    const checkSums = [3, 2, 1]
    const group = '?###????????'.split('')

    const result = findAllGroupPermutation(group, checkSums)

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({
        checkSumCount: 1,
        permutations: 1,
      }),
      expect.objectContaining({
        checkSumCount: 2,
        permutations: 6,
      }),
      expect.objectContaining({
        checkSumCount: 3,
        permutations: 10,
      }),
    ]))
  })

  it("Correctly solves ??????#???#??????? with 2,7,1,1", () => {
    const group = '??????#???#???????'.split('')
    const checkSums = [2, 7, 1, 1]

    const result = findAllGroupPermutation(group, checkSums)

    expect(result).toEqual(expect.arrayContaining([
      expect.objectContaining({ checkSumCount: 2, permutations: 14 }),
      expect.objectContaining({ checkSumCount: 3, permutations: 47 }),
      expect.objectContaining({ checkSumCount: 4, permutations: 50 })
    ]))

    expect(result.length).toEqual(3)
  })

})

describe("#getCaseQueue", () => {
  it("correctly returns queue for normal case", () => {
    const permutations = [{
      checkSumCount: 0,
      permutations: 1
    },
    {
      checkSumCount: 1,
      permutations: 3
    },
    {
      checkSumCount: 2,
      permutations: 1
    }]

    const groups = ['???'.split(''), '###'.split('')]
    const checkSums = [1,1,3]
    const results = getCaseQueue(permutations, groups, checkSums, 1)

    expect(results).toEqual(expect.arrayContaining([
      { checkSums: [1,1,3], groups: [['#', '#', '#']], permutations: 1 },
      { checkSums: [1,3], groups: [['#', '#', '#']], permutations: 3 },
      { checkSums: [3], groups: [['#', '#', '#']], permutations: 1 }
    ]))
  })

  it("Can handle no group return", () => {
    const permutations = [{
      checkSumCount: 0,
      permutations: 1
    },
    {
      checkSumCount: 1,
      permutations: 3
    },
    {
      checkSumCount: 2,
      permutations: 1
    }]

    const groups = ['###'.split('')]
    const checkSums = [1,1,3]

    const results = getCaseQueue(permutations, groups, checkSums, 1)

    expect(results).toEqual(expect.arrayContaining([
      { checkSums: [1,1,3], groups: [], permutations: 1 },
      { checkSums: [1,3], groups: [], permutations: 3 },
      { checkSums: [3], groups: [], permutations: 1 }
    ]))
  })

  it("Can handle no checksum return", () => {
    const permutations = [{
      checkSumCount: 0,
      permutations: 1
    },
    {
      checkSumCount: 1,
      permutations: 3
    },
    {
      checkSumCount: 2,
      permutations: 1
    }]

    const groups = ['???'.split(''), '###'.split('')]
    const checkSums = [1,1]
    const results = getCaseQueue(permutations, groups, checkSums, 1)

    expect(results).toEqual(expect.arrayContaining([
      { checkSums: [1,1], groups: [['#', '#', '#']], permutations: 1 },
      { checkSums: [1], groups: [['#', '#', '#']], permutations: 3 },
      { checkSums: [], groups: [['#', '#', '#']], permutations: 1 }
    ]))
  })
})

describe("#solveBaseCase", () => {
  it.each(testBaseCases.map((testBaseCase, i) => [testBaseCase, testAnswers[i]]))("Can solve base case %j with solution of %i", (baseCase, expected) => {
    const result = solveBaseCase(baseCase)
    expect(result).toEqual(expected)
  })
})



