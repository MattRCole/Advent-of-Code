const arr = require('../util/array')
const {
  parseFile,
  getCheckSums,
  getPreliminaryTestIndexes,
  testAlongRow,
  testAlongColumn,
  solveTerrainMap,
} = require('./script-01')

const testTerrainMaps = parseFile(require('fs').readFileSync('./13/example.txt', { encoding: 'utf-8' }))

const checkSums = [
  { rows: [5, 4, 3, 3, 4, 4, 5], columns: [4, 2, 5, 2, 3, 3, 2, 5, 2] },
  { rows: [4, 3, 5, 7, 7, 5, 3], columns: [5, 2, 4, 4, 3, 3, 4, 4, 5] },
  { rows: [5, 5, 5, 7, 5, 9, 7], columns: [2, 5, 6, 2, 2, 4, 3, 1, 2, 6, 3, 5, 2] }
]

describe('#parseFile', () => {
  it('Can correctly parse the example file', () => {

    expect(testTerrainMaps).toEqual([
      [
        '#.##..##.',
        '..#.##.#.',
        '##......#',
        '##......#',
        '..#.##.#.',
        '..##..##.',
        '#.#.##.#.'
      ],
      [ 
        '#...##..#',
        '#....#..#',
        '..##..###',
        '#####.##.',
        '#####.##.',
        '..##..###',
        '#....#..#'
      ],
      [
        '.##..#...#.#.',
        '.##..#...#.#.',
        '.....#..####.',
        '.##.#.#..###.',
        '.##...#..#..#',
        '#####.##.#.#.',
        '#.##.#..#.#.#'
         
      ]
    ])
  })
})

describe('#getCheckSums', () => {
  it.each(arr.zip(testTerrainMaps, checkSums))('Correctly evaluates %j to the check sum %j', (terrainMap, checkSum) => {
    const result = getCheckSums(terrainMap)

    expect(result).toEqual(checkSum)
  })
})

describe('#getPreliminaryCheckIndexes', () => {
  it.each([
    [[1,1,2,2,1], [1, 3]],
    [[5, 4, 3, 3, 4, 4, 5], []],
    [[4, 2, 5, 2, 3, 3, 2, 5, 2], [5]],
    [[5, 5, 5, 7, 5, 9, 7], [1]]
  ])('for %j, returns the correct indexes %j', (checkSums, expectedIndexes) => {
    const results = getPreliminaryTestIndexes(checkSums)

    expect(results).toEqual(expectedIndexes)
  })
})

describe('#testAlongRow', () => {
  it.each(arr.zip(testTerrainMaps, [3, 4, 1], [false, true, true]))('for terrain map %j, given a row of %i it returns %j', (terrainMap, rowToTest, expected) => {
    const result = testAlongRow(rowToTest, terrainMap)

    expect(result).toEqual(expected)
  })
})

describe('#testAlongColumn', () => {
  it.each(arr.zip(testTerrainMaps, [5, 3, 2], [true, false, false]))('for terrain map %j, given a column of %i to test it returns %j', (terrainMap, columnToTest, expected) => {
    const result = testAlongColumn(columnToTest, terrainMap)

    expect(result).toEqual(expected)
  })
})

describe('#solveTerrainMap', () => {
  it.each(arr.zip(testTerrainMaps, [5, 400, 100]))('for terrain map %j, it returns %i', (terrainMap, expected) => {
    const result = solveTerrainMap(terrainMap)

    expect(result).toBe(expected)
  })
})
