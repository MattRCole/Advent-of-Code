const fs = require('node:fs')
const arr = require('../util/array')

const {
  solveTerrainMapWithInfo,
  getCheckSums,
  parseFile,
  getPreliminaryTestIndexes,
} = require('./script-01')

const ROCK = '#'

/** @type {(terrainMap: string[]) => boolean[][]} */
const terrainMapToBitMap = terrainMap => terrainMap.map(row => row.split('').map(c => c === ROCK))

/** @type {(terrainMap: string[][], indexBeforeLine: number, direction: 'horizontal' | 'vertical') => number} */
const getDiffsAcrossLine = (terrainMap, indexBeforeLine, direction) => {
  const bitMap = terrainMapToBitMap(terrainMap)

  if (direction === 'horizontal') {
    let diff = 0
    for(let delta = 0; delta < terrainMap.length; delta++) {
      const j = indexBeforeLine - delta
      const mirrorJ = (indexBeforeLine + 1) + delta
      if (j < 0 || mirrorJ >= terrainMap.length) return diff
      diff += arr.sum(arr.zip(bitMap[j], bitMap[mirrorJ]).map(([a, b]) => a ^ b))
    }
    return diff
  }

  if (direction === 'vertical') {
    let diff = 0
    for(let delta = 0; delta < terrainMap.length; delta++) {
      const i = indexBeforeLine - delta
      const mirrorI = (indexBeforeLine + 1) + delta
      if (i < 0 || mirrorI >= bitMap[0].length) return diff

      for(let j = 0; j < bitMap.length; j++) {
        diff += bitMap[j][i] ^ bitMap[j][mirrorI]
      }
    }
    return diff
  }

}

const main = () => {
  const terrainMaps = parseFile(fs.readFileSync('./13/input.txt', { encoding: 'utf-8' }))

  let result = 0
  for(let i = 0; i < terrainMaps.length; i++) {
    const terrainMap = terrainMaps[i]
    console.log(terrainMap.join('\n'))

    let solutionFound = false
    for(let horizontalI = 0; horizontalI < arr.lastIndex(terrainMap); horizontalI++) {
      const diffs = getDiffsAcrossLine(terrainMap, horizontalI, "horizontal")
      if (diffs === 1) {
        console.log({indexBeforeLine: horizontalI, direction: "horizontal"})
        result += (100 * (1 + horizontalI))
        solutionFound = true
        break
      }
    }
    if (solutionFound) continue

    for(let verticalI = 0; verticalI < arr.lastIndex(terrainMap[0]); verticalI++) {
      const diffs = getDiffsAcrossLine(terrainMap, verticalI, "vertical")
      if (diffs === 1) {
        console.log({indexBeforeLine: verticalI, direction: "vertical"})
        result += 1 + verticalI
        solutionFound = true
        break
      }
    }

    if (solutionFound === false) {
      console.log("No solution found")
      break
    }

  }
  console.log({ result })
}

if (require.main === module) {
  main()
}
