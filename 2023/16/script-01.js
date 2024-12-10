const fs = require("node:fs")


const DIRECTIONS = /** @type {const} */ ([
  "NORTH",
  "EAST",
  "SOUTH",
  "WEST",
])

/** @typedef {(typeof DIRECTIONS)[number]} Direction */
/** @typedef {{ [key: number]: { [key: number]: string} }} ModMap */
/** @typedef {{ x: number, y: number }} Point */
/** @typedef {(typeof SPLITTERS)[number]} Splitter */
/** @typedef {(typeof MIRRORS)[number]} Mirror */
/** @typedef {Splitter | Mirror} Modifier */

const Traveling = {
  North: DIRECTIONS[0],
  East: DIRECTIONS[1],
  South: DIRECTIONS[2],
  West: DIRECTIONS[3]
}

const DirectionMap = {
  [Traveling.North]: '^',
  [Traveling.East]: '>',
  [Traveling.South]: 'v',
  [Traveling.West]: '<',
}

const MIRRORS = /** @type {const} */ (['/', '\\'])
const SPLITTERS = /** @type {const} */ (['-', '|'])

/** @type {(char: string) => char is Modifier} */
const isModifier = char => [...MIRRORS, ...SPLITTERS].includes(char)
/** @type {(char: str) => char is Mirror} */
const isMirror = char => MIRRORS.includes(char)
/** @type {(char: str) => char is Splitter} */
const isSplitter = char => SPLITTERS.includes(char)

/** @type {{ [M in Mirror]: { [D in Direction]: Direction } }} */
const MirrorMap = {
  '/': {
    [Traveling.North]: Traveling.East,
    [Traveling.East]: Traveling.North,
    [Traveling.South]: Traveling.West,
    [Traveling.West]: Traveling.South,
  },
  '\\': {
    [Traveling.North]: Traveling.West,
    [Traveling.East]: Traveling.South,
    [Traveling.South]: Traveling.East,
    [Traveling.West]: Traveling.North,
  }
}

/** @type {{ [S in Splitter]: { [D in Direction]: Direction[] } }} */
const SplitterMap = {
  '-': {
    [Traveling.North]: [Traveling.East, Traveling.West],
    [Traveling.South]: [Traveling.East, Traveling.West],
    [Traveling.East]: [Traveling.East],
    [Traveling.West]: [Traveling.West],
  },
  '|': {
    [Traveling.East]: [Traveling.North, Traveling.South],
    [Traveling.West]: [Traveling.North, Traveling.South],
    [Traveling.North]: [Traveling.North],
    [Traveling.South]: [Traveling.South],
  }
}

/** @typedef {{ xyModMap: ModMap, yxModMap: ModMap, xBoundary: number, yBoundary: number }} PuzzleInput */

/** @type {(file: string) => PuzzleInput} */
const parseInput = file => {
  const lines = file.split('\n')
  const xBoundary = lines[0].split('').length
  const yBoundary = lines.length
  const xyModMap = {}
  const yxModMap = {}

  lines.forEach((line, y) => line.split('').forEach((char, x) => {
    if (isModifier(char) === false) return

    xyModMap[x] = { ...(xyModMap[x] || {}), [y]: char }
    yxModMap[y] = { ...(yxModMap[y] || {}), [x]: char }
  }))

  return { xyModMap, yxModMap, xBoundary, yBoundary }
}

/** @type {(x: number, y: number, traveling?: Direction) => string} */
const pointToKey = (x, y, traveling) => `${x}:${y}${traveling === undefined ? '' : `:${traveling}`}` 

/** @type {(key: string) => { x: number, y: number, traveling?: Direction }} */
const keyToPoint = key => {
  const [x, y, ...rest] = key.split(':')

  return {
    x: parseInt(x),
    y: parseInt(y),
    ...(rest.length ? { traveling: rest[0] } : {})
  }
}

/** @typedef {Point & PuzzleInput & { traveling: Direction }} CastRayArgs */

const getNumericKeys = obj => Object.keys(obj).map(k => parseInt(k))
/** @type {(args: CastRayArgs) => { rayExitedMap: boolean, collisionAt: { x: number, y: number }, stepsTaken: Set<string> }} */
const castRay = ({
  x,
  y,
  traveling,
  xyModMap,
  yxModMap,
  xBoundary,
  yBoundary
}) => {
  const travelingNorthSouth = [Traveling.North, Traveling.South].includes(traveling)
  const travelingNorthOrWest = [Traveling.North, Traveling.West].includes(traveling)
  const delta = travelingNorthOrWest ? -1 : 1
  const firstKey = travelingNorthSouth ? x : y
  const secondKey = travelingNorthSouth ? y : x
  const modMap = travelingNorthSouth ? xyModMap : yxModMap

  /** @type {(obj: { [secondKey: number]: string }) => number} */
  const getNextModKey = obj => {
    if (obj === undefined) return -1

    const arr = getNumericKeys(obj)

    if (arr === undefined) return -1;

    const filtered = arr.filter((num) =>
      travelingNorthOrWest ? num < secondKey : num > secondKey
    );
    // console.log({ filtered, arr, secondStartingKey });
    if (filtered.length === 0) return -1;

    const ranIntoObjectAt = filtered.at(travelingNorthOrWest ? -1 : 0);

    return ranIntoObjectAt;
  };

  const getPointFrom1st2ndKeys = (first, second) => travelingNorthSouth ? { x: first, y: second }: { x: second, y: first }

  const secondModKey = getNextModKey(modMap[firstKey])
  const { limit, rayExitedMap } = secondModKey !== -1 ? { limit: secondModKey + delta, rayExitedMap: false } : {
    limit: delta === -1 ? -1 : travelingNorthSouth ? yBoundary : xBoundary,
    rayExitedMap: true
  }
  // console.log({ x, y, traveling, limit, rayExitedMap, secondModKey, firstKey, secondKey, firstKey, delta, xBoundary, yBoundary })
  const stepsTaken = new Set()
  for (let i = secondKey + delta; i !== limit; i += delta) {
    const { x, y } = getPointFrom1st2ndKeys(firstKey, i)
    stepsTaken.add(pointToKey(x, y, traveling))
  }
  return {
    rayExitedMap,
    collisionAt: secondModKey === -1 ? { x: -1, y: -1 } : getPointFrom1st2ndKeys(firstKey, secondModKey),
    stepsTaken,
  }
}

/** @type {(input: PuzzleInput, firstPoint?: Point, firstDirection?: Direction) => Set<string>} */
const floodMap = (input, firstPoint = { x: 0, y: 0 }, firstDirection = Traveling.East) => {
  // const firstPoint = { x: 0, y: 0 }
  // const firstDirection = Traveling.East
  const allVisitedPoints = new Set()

  allVisitedPoints.add(pointToKey(firstPoint.x, firstPoint.y, firstDirection))

  /** @type {(point: Point, traveling: Direction) => ({ startingPoint: Point, traveling: Direction })[]} */
  const getNewStackItems = (point, traveling) => {
    const char = (input.xyModMap[point.x] || {})[point.y]
    if (!isModifier(char)) {
      // console.log({ point, traveling, char })
      return []
    }

    if (isMirror(char)) {
      return [{ startingPoint: point, traveling: MirrorMap[char][traveling] }]
    }
    if (isSplitter(char)) {
      return SplitterMap[char][traveling].map(direction => ({ startingPoint: point, traveling: direction }))
    }
  }

  const primaryModifierItems = getNewStackItems(firstPoint, firstDirection)
  /** @type {({ startingPoint: Point, traveling: Direction })[]} */
  const stack = [
    ...(primaryModifierItems.length ? primaryModifierItems : [{ startingPoint: firstPoint, traveling: firstDirection }])
  ]
  while (stack.length) {
    const searchItem = stack.pop()
    if (searchItem === undefined) throw new Error("nope")
    const {
      rayExitedMap,
      collisionAt,
      stepsTaken
    } = castRay({ ...searchItem.startingPoint, ...input, traveling: searchItem.traveling })
    // console.log({ rayExitedMap, collisionAt, stepsTaken: [...stepsTaken.values()]})
    let canSkipToNextLoop = false
    for(const key of stepsTaken.values()) {
      if (allVisitedPoints.has(key)) {
        canSkipToNextLoop = true
        break
      }
      allVisitedPoints.add(key)
    }

    if (canSkipToNextLoop || rayExitedMap) continue

    stack.push(...getNewStackItems(collisionAt, searchItem.traveling))
  }

  return allVisitedPoints
}

/** @type {(xBoundary: number, yBoundary: number, ...modMaps: ModMap[]) => string[][]} */
const renderXYMaps = (xBoundary, yBoundary, ...modMaps) => {
  const renderedMap = (new Array(yBoundary)).fill().map(() => (new Array(xBoundary)).fill('.'))
  for(const modMap of modMaps) {
    for(const x of getNumericKeys(modMap)) {
      for(const y of getNumericKeys(modMap[x])) {
        const char = modMap[x][y]
        renderedMap[y][x] = char
      }
    }
  }
  return renderedMap
}

/** @type {(xBoundary: number, yBoundary: number, ...modMaps: ModMap[]) => void} */
const logXYMaps = (xBoundary, yBoundary, ...modMaps) => {
  const renderedMap = renderXYMaps(xBoundary, yBoundary, ...modMaps)
  console.log(renderedMap.map(row => row.join('')).join('\n'))
}

/** @type {(set: Set<string>) => ModMap} */
const keySetToXYMap = stepSet => {
  const modMap = {}
  for(const key of stepSet.values()) {
    const { x, y, traveling } = keyToPoint(key)
    const char = traveling === undefined ? '#' : DirectionMap[traveling]
    modMap[x] = { ...(modMap[x] || {}), [y]: char }
  }
  return modMap
}

/** @type {(modMap: ModMap) => Point[]} */
const xyMapToPoints = modMap => {
  const points = []
  for(const x of getNumericKeys(modMap)) {
    for(const y of getNumericKeys(modMap[x])) {
      points.push({ x, y })
    }
  }
  return points
}

const main = () => {
  const file = fs.readFileSync("./16/input.txt", { encoding: "utf-8" })
  const input = parseInput(file)

  const allVisitedPoints = floodMap(input)
  const finalLightMap = keySetToXYMap(allVisitedPoints)
  logXYMaps(input.xBoundary, input.yBoundary, finalLightMap)
  console.log({ res: xyMapToPoints(finalLightMap).length })
}

if (require.main === module) {
  main()
}

module.exports = {
  parseInput,
  floodMap,
  castRay,
  keySetToXYMap,
  pointToKey,
  keyToPoint,
  logXYMaps,
  xyMapToPoints,
  DIRECTIONS,
  MIRRORS,
  SPLITTERS,
  Traveling,
  SplitterMap,
  MirrorMap
}