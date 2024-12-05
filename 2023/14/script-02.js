const fs = require("node:fs")

const arr = require("../util/array")

/** @typedef {{ [key: number]: { [key: number]: boolean }}} RockMap */

const ROLLING_ROCK = 'O'
const STOPPING_ROCK = '#'



/** @type {(file: string) => { rollingRocks: RockMap, stoppingRocks: RockMap }} */
const parseInput = file => {
  /** @type {RockMap} */
  const rollingRocks = {}
  /** @type {RockMap} */
  const stoppingRocks = {}

  file.split('\n').map((r, j) => r.split('').forEach((char, i) => {
    if (char === ROLLING_ROCK) {
      rollingRocks[j] = { ...(rollingRocks[j] || {}), [i]: true }
    } else if (char === STOPPING_ROCK) {
      stoppingRocks[j] = { ...(stoppingRocks[j] || {}), [i]: true }
    }
  }))
  return { rollingRocks, stoppingRocks }
}

const path = (obj, ...path) => {
  let item = obj
  for (p of path) {
    item = item[p]
    if (item === undefined) return undefined
  }
  return item
}

/** @type {(currentRollingRocks: RockMap, stoppingRocks: RockMap, direction: 'north' | 'south' | 'east' | 'west', boundX: number, boundY: number) => RockMap} */
const rollRocks = (currentRollingRocks, stoppingRocks, direction, boundX, boundY) => {
  /** @type {RockMap} */
  const newRockMap = {}
  
  const maxI = Math.max(...Object.entries(currentRollingRocks).reduce((acc, [_, iPair]) => [...acc, ...Object.keys(iPair).map(k => parseInt(k))], []))
  const maxJ = Math.max(...Object.keys(currentRollingRocks).map(k => parseInt(k)))

  const iDelta = direction === 'east' ? -1 : 1
  const jDelta = direction === 'south' ? -1 : 1
  const lookI = direction === 'east' ? 1 : direction === 'west' ? -1 : 0
  const lookJ = direction === 'south' ? 1 : direction === 'north' ? -1 : 0
  const startingI = direction === 'east' ? maxI : 0
  const startingJ = direction === 'south' ? maxJ : 0
  // instead of doing this, we could just sort each layer of keys...?
  for(let j = startingJ; j >= 0 && j < boundY; j += jDelta) {
    for(let i = startingI; i >= 0 && i < boundX; i += iDelta) {
      if (!path(currentRollingRocks, j, i)) continue

      let searchI = i
      let searchJ = j
      shouldContinue = true
      while(shouldContinue) {
        searchI += lookI
        searchJ += lookJ
        const shouldStopRolling = searchI < 0 || searchI >= boundX
          || searchJ < 0 || searchJ >= boundY
          || path(stoppingRocks, searchJ, searchI) || path(newRockMap, searchJ, searchI)

        if (shouldStopRolling) {
          const foundI = searchI - lookI
          const foundJ = searchJ - lookJ
          newRockMap[foundJ] = { ...(newRockMap[foundJ] || {}), [foundI]: true }
          shouldContinue = false
        }
      }
    }
  }
  return newRockMap
}

/** @type {(boundX: number, boundY: number, rollingRocks: RockMap, stoppingRocks: RockMap) => string[][]} */
const renderRockMaps = (boundX, boundY, rollingRocks, stoppingRocks) => {
  const toRender = (new Array(boundY)).fill().map(() => (new Array(boundX)).fill('.'))

  for(const [yStr, xPairs] of Object.entries(rollingRocks)) {
    const y = parseInt(yStr)
    for (const xStr of Object.keys(xPairs)) {
      const x = parseInt(xStr)
      toRender[y][x] = ROLLING_ROCK
    }
  }
  for(const [yStr, xPairs] of Object.entries(stoppingRocks)) {
    const y = parseInt(yStr)
    for (const xStr of Object.keys(xPairs)) {
      const x = parseInt(xStr)
      toRender[y][x] = STOPPING_ROCK
    }
  }
  return toRender
}

const logRockMaps = (boundX, boundY, rollingRocks, stoppingRocks) => {
  console.log(renderRockMaps(boundX, boundY, rollingRocks, stoppingRocks).map(r => r.join('')).join('\n'))
}

const rockMapsAreEqual = (mapA, mapB) => {
  const compareKeys = (objA, objB) => {
    return Object.keys(objA).sort().join('|||') === Object.keys(objB).sort().join('|||')
  }

  if (!compareKeys(mapA, mapB)) return false

  for (const key of Object.keys(mapA)) {
    const index = parseInt(key)
    if (!compareKeys(mapA[index], mapB[index])) return false
  }
  return true
}

const hashRockMap = rockMap => {
  return Object.keys(rockMap).sort().map(k => `${k}(${Object.keys(rockMap[k]).sort().join(',')})`).join(',')
}



const cycleRocks = (rollingRocks, stoppingRocks, boundX, boundY) => {
  const directions = ['north', 'west', 'south', 'east']
  // logRockMaps(boundX, boundY, rollingRocks, stoppingRocks)
  // console.log('')
  let rockMap = rollingRocks
  for(const direction of directions) {
    rockMap = rollRocks(rockMap, stoppingRocks, direction, boundX, boundY)
    // console.log(`after rolling to the ${direction}:`)
    // logRockMaps(boundX, boundY, rockMap, stoppingRocks)
    // console.log(rockMap)
    // console.log('')
  }

  return rockMap
}
/** @type {(count: number, rollingRocks: RockMap, stoppingRocks: RockMap, boundX: number, boundY: number) => RockMap} */
const runRockCycles = (count, rollingRocks, stoppingRocks, boundX, boundY) => {
  let rockMap = rollingRocks
  const numZeros = Math.log10(count) + 1
  /** @type {{ [hash: string]: number }} */
  const observedStates = {}
  observedStates[hashRockMap(rollingRocks)] = 0
  console.log('')
  let cycleObserved = ''
  for(let i = 1; i <= count; i++) {
    process.stdout.write(i.toString().padStart(numZeros, '0') + `/${count}, ${((i/count) * 100).toPrecision(2)}%          \n`)
    const newRockMap = cycleRocks(rockMap, stoppingRocks, boundX, boundY)
    const hash = hashRockMap(newRockMap)
    if (observedStates[hash] !== undefined) {
      if (!cycleObserved) {
        const predictedPeriod = i - observedStates[hash]
        console.log(`Observed repeat state on step #${i}, Period: ${predictedPeriod}. Predicting next cycle on step: ${i + predictedPeriod}, originally seen on step #${observedStates[hash]}`)
        const cyclesToSkip = Math.floor((count - i) / predictedPeriod)
        const moveToStepMinusOne = i + (cyclesToSkip * predictedPeriod)
        console.log(`Skipping forward to step #${moveToStepMinusOne + 1}`)
        i = moveToStepMinusOne
        cycleObserved = hash
      } else if (hash !== cycleObserved) {
        rockMap = newRockMap
        continue
      } else {
        console.log(`Second cycle observed at step #${i}`)
        throw new Error(hash)
      }
    }
      observedStates[hash] = i
      rockMap = newRockMap
  }
  return rockMap
}

const main = () => {
  const file = fs.readFileSync("./14/input.txt", { encoding: "utf-8" })
  const { rollingRocks, stoppingRocks } = parseInput(file)
  const simpleFile = file.split('\n')
  const boundX = simpleFile[0].length
  const boundY = simpleFile.length
  // console.log(file + "\n\n")
  
  const newRockMap = runRockCycles(1000000000, rollingRocks, stoppingRocks, boundX, boundY)
  // const newRockMap = cycleRocks(rollingRocks, stoppingRocks, boundX, boundY)
  const renderedRockMap = renderRockMaps(boundX, boundY, newRockMap, stoppingRocks)
  logRockMaps(boundX, boundY, newRockMap, stoppingRocks)
  console.log({ res: arr.sum(renderedRockMap.map((r, index) => (r.filter(c => c === ROLLING_ROCK).length * (renderedRockMap.length - index)))) })
}

if (require.main === module) {
  main()
}

module.exports = {
  cycleRocks,
  rockMapsAreEqual,
  logRockMaps,
}