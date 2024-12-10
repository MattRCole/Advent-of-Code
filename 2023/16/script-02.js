const fs = require("node:fs")
const { floodMap, parseInput, keySetToXYMap, xyMapToPoints, logXYMaps, Traveling } = require('./script-01')

/** @typedef {import('./script-01').Direction} Direction */
/** @typedef {import('./script-01').Mirror} Mirror */
/** @typedef {import('./script-01').ModMap} ModMap */
/** @typedef {import('./script-01').PuzzleInput} PuzzleInput */

/** @type {(input: PuzzleInput, startingPoint: Point, startingDirection: Direction) => ModMap} */
const floodMapAtPositionHelper = (input, startingPoint, startingDirection) => {
  const res = floodMap(input, startingPoint, startingDirection)
  return keySetToXYMap(res)
}

/** @type {(input: PuzzleInput) => ModMap[]} */
const floodMapFromAllDirections = input => {
  const results = []
  for(let i = 0; i < input.xBoundary; i++) {
    const traveling = Traveling.South
    const startingPoint = { x: i, y: 0 }
    const map = floodMapAtPositionHelper(input, startingPoint, traveling)
    results.push({ startingPoint, traveling, map })
  }
  for(let i = 0; i < input.yBoundary; i++) {
    const traveling = Traveling.East
    const startingPoint = { x: 0, y: i }
    const map = floodMapAtPositionHelper(input, startingPoint, traveling)
    results.push({ startingPoint, traveling, map })
  }
  for(let i = 0; i < input.yBoundary; i++) {
    const traveling = Traveling.West
    const startingPoint = { x: input.xBoundary - 1, y: i }
    const map = floodMapAtPositionHelper(input, startingPoint, traveling)
    results.push({ startingPoint, traveling, map })
  }
  for(let i = 0; i < input.xBoundary; i++) {
    const traveling = Traveling.North
    const startingPoint = { x: i, y: input.yBoundary - 1 }
    const map = floodMapAtPositionHelper(input, startingPoint, traveling)
    results.push({ startingPoint, traveling, map })
  }
  return results
}

const main = () => {
  const file = fs.readFileSync("./16/input.txt", { encoding: "utf-8" })
  const input = parseInput(file)

  // const allVisitedPoints = floodMap(input)
  // const finalLightMap = keySetToXYMap(allVisitedPoints)
  // logXYMaps(input.xBoundary, input.yBoundary, finalLightMap)
  const allMaps = floodMapFromAllDirections(input)
  let max = 0
  for(const res of allMaps) {
    const { map } = res
    const points = xyMapToPoints(map)
    if (points.length > max) {
      max = points.length
      console.log(`New max: ${max}, point: ${JSON.stringify(res.startingPoint)}`)
    }
    logXYMaps(input.xBoundary, input.yBoundary, map)
    console.log('')
  }
  console.log({ res: max })
}

if (require.main === module) {
    main()
}