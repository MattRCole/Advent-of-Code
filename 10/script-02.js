const fs = require("node:fs")

const file = fs.readFileSync("./10/input.txt", { encoding: "utf-8" })

// ------------- Helper Objects ------------

/** @typedef {{ row: number, column: number }} Coords */

/** @type {string[][]} */
const rawMap = file.split('\n').map(l => l.split(''))
const sCoords = rawMap.reduce((acc, line, row) => {
    if (acc !== undefined) return acc
    const column = line.indexOf('S')
    if (column !== -1) return { row, column }
    return undefined
}, undefined)

const Compass = {
    North: 'North',
    South: 'South',
    East: 'East',
    West: 'West'
}

/** @typedef {keyof typeof Compass} Direction */

const Opposite = {
    North: 'South',
    South: 'North',
    East: 'West',
    West: 'East'
}

const compass = [
    Compass.North,
    Compass.East,
    Compass.South,
    Compass.West
]

const Turn = {
    Left: 'Left',
    Right: 'Right',
}

/** @type {keyof typeof Turn} TTurn */


/** @type {{ [connector: string]: Direction[] }} */
const connectorMap = {
    '|': [Compass.North, Compass.South],
    '-': [Compass.East, Compass.West],
    'L': [Compass.North, Compass.East],
    'J': [Compass.North, Compass.West],
    '7': [Compass.South, Compass.West],
    'F': [Compass.South, Compass.East],
    '.': []
}

/** @type {{ [D in keyof typeof Compass]: string[] }} */
const connectsTo = Object.keys(connectorMap).reduce((acc, k) => {
    if (connectorMap[k].length === 0) return acc
    const toAdd = {}
    for (const compass of connectorMap[k]) {
        acc[compass] = acc[compass] ? [...acc[compass], k] : [k]
    }
    return acc
}, {})

/*
connectsTo = {
    [Compass.North]: ['|', 'L', 'J'],
    [Compass.East]: ['-', 'L', 'F'],
    ... etc
}
*/

const fancyMap = {
    '|': '║',
    '-': '═',
    'L': '╚',
    'J': '╝',
    '7': '╗',
    'F': '╔',
    'S': '╳'
}

/**
 * @template T
 * @template R
 * @param {(acc: R, value: T, coords: Coords) => R} callback 
 * @param {Coords} coords 
 * @param {T[][]} map 
 * @param {R} initialValue 
 * @returns {R}
 */
function reduceNeighbors(callback, { row, column }, map, initialValue) {
    const rowIndexes = [row - 1, row, row + 1].filter(i => i >= 0 && i < map.length)
    const columnIndexes = [column - 1, column, column + 1].filter(i => i >= 0 && i < map[row].length)


    const coordinatesToVisit = rowIndexes.reduce((acc, r) => {
        return [...acc, ...columnIndexes.map(c => ({ row: r, column: c }))]
    }, []).filter(coord => (coord.row !== row || coord.column !== column) && (coord.row === row || coord.column === column))

    let acc = initialValue
    for (let coordinate of coordinatesToVisit) {
        acc = callback(acc, map[coordinate.row][coordinate.column], coordinate)
    }
    return acc
}

/** @type {(from: Coords, towards: Coords) => keyof typeof Compass} */
const getDirection = (from, towards) => {
    if (from.row === towards.row && from.column === towards.column) throw new Error(`Trying to determine direction of same coordinates: ${JSON.stringify(from)}`)
    if (from.column === towards.column) {
        return from.row - towards.row < 0 ? Compass.South : Compass.North
    }
    if (from.row === towards.row) {
        return from.column - towards.column < 0 ? Compass.East : Compass.West
    }

    throw new Error(`Trying to check diagonal direction! from: ${JSON.stringify(from)}, towards: ${JSON.stringify(towards)}`)
}

const determineSPipeType = (coords, map) => {
    const connectionDirections = reduceNeighbors((acc, pipeSection, pipeCoords) => {
        const toS = getDirection(pipeCoords, coords)
        if (connectsTo[toS].includes(pipeSection)) return [...acc, getDirection(coords, pipeCoords)]

        return acc
    }, coords, map, [])

    if (connectionDirections.length > 2) throw new Error('Invalid S segment type!')

    for (const pipeSegment of Object.keys(connectorMap)) {
        const directions = connectorMap[pipeSegment]
        if (directions.includes(connectionDirections[0]) && directions.includes(connectionDirections[1])) return pipeSegment
    }

    throw new Error(`Could not determine pipe type for directions ${JSON.stringify(connectionDirections)}`)
}

const areSameCoordinates = (a, b) => a.row === b.row && a.column === b.column

// Warning, this might not move you
/** @type {(coord: Coords, direction: keyof typeof Compass) => Coords} */
const moveDirection = ({ row, column}, direction, map = rawMap) => {
    const newCoords = {
        [Compass.North]: { row: Math.max(0, row - 1), column },
        [Compass.East]: { row, column: Math.min(map[row].length - 1, column + 1) },
        [Compass.South]: { row: Math.min(map.length - 1, row + 1), column },
        [Compass.West]: { row, column: Math.max(0, column - 1) }

    }

    return newCoords[direction]
}

const sPipeType = determineSPipeType(sCoords, rawMap)

// Make sure there's actually a turn before calling
/** @type {(from: Direction, to: Direction) => } */
const getTurnType = (from, to) => {
    const nextFrom = (compass.indexOf(from) + 1) % compass.length
    const prevFrom = (compass.indexOf(from) + (compass.length - 1)) % compass.length
    const toIndex = compass.indexOf(to)
    if (nextFrom === toIndex) return Turn.Right
    if (prevFrom === toIndex) return Turn.Left

    throw new Error(`Cannot turn around (at least I think that's what happened)! from: ${from}, to: ${to}, result: ${{ nextFrom, prevFrom }}`)
}

const sPipeDirections = connectorMap[sPipeType]
let direction = sPipeDirections[0]

let currentCoords = { ...sCoords }
/** @type {({ coords: Coords, direction: Direction })[]} */
const path = [{ coords: sCoords, directions: Opposite[sPipeDirections[1]] === direction ? [direction] : [direction, Opposite[sPipeDirections[1]]] }]
/** @type  */
const turns = {
    [Turn.Left]: 0,
    [Turn.Right]: 0,
}

do {
    const newCoords = moveDirection(currentCoords, direction)
    const pipe = rawMap[newCoords.row][newCoords.column]
    if (pipe === 'S') break
    const newDirection = connectorMap[pipe].filter(dir => dir !== Opposite[direction])[0]
    const prevDirection = direction
    direction = newDirection

    const sameDirection = newDirection === prevDirection
    path.push({ coords: newCoords, directions: sameDirection ? [newDirection] : [prevDirection, newDirection] })
    currentCoords = { ...newCoords }

    if (sameDirection) {
        continue
    }

    const turn = getTurnType(prevDirection, newDirection)
    turns[turn] += 1
} while (!areSameCoordinates(sCoords, currentCoords))

const sparsePath = path.reduce((acc, { coords }) => ({
    ...acc,
    [coords.row]: {
        ...(acc[coords.row] || {}),
        [coords.column]: true
    }
}), {})


// process.exit(0)

const checkRotation = turns.Left > turns.Right ? Turn.Left : Turn.Right

const turnDirection = (from, turnDir) => compass[(compass.indexOf(from) + (turnDir === Turn.Left ? compass.length - 1 : 1)) % compass.length]

const isPathCoord = ({ row, column }, sPath = sparsePath) => {
    return sPath[row] ? sPath[row][column] || false : false
}

const debugInefficienciesMap = new Array(rawMap.length).fill(undefined).map(_ => new Array(rawMap[0].length).fill(0))

let sparseGround = {}
for (const { coords, directions } of path) {
    for (const direction of directions) {
        const directionOfTravel = turnDirection(direction, checkRotation)

        let checkCoords = coords
        do {
            const segment = rawMap[checkCoords.row][checkCoords.column]
            const prev = checkCoords
            const { row, column } = prev
            debugInefficienciesMap[row][column] += 1
            checkCoords = moveDirection(checkCoords, directionOfTravel)

            // if (segment === '.') {
            //     console.log(sparseGround, { row, column })
            // }
            if (!isPathCoord(prev)) sparseGround = { ...sparseGround, [row]: { ...(sparseGround[row] || {}), [column]: true } }

            if (areSameCoordinates(checkCoords, { row, column })) throw new Error(`Hek, check: ${JSON.stringify(checkCoords)}, original: ${JSON.stringify(coords)}, direction: ${directionOfTravel}, ogDirection: ${direction}, turning: ${checkRotation}`)

        } while (!isPathCoord(checkCoords))
    }
}
const severity = [' ', '░','░','░','▒','▒','▓','█']
console.log('--------------------------------')
console.log(debugInefficienciesMap.map(r => r.map(c => severity[c]).join('')).join('\n'))
console.log('--------------------------------')
console.log(JSON.stringify(sparseGround))
console.log('\n\n\n---simplified path---\n\n\n')
console.log(rawMap.map((col, row) => col.map((_, column) => isPathCoord({ row, column }) ? 'X' : '.').join('')).join('\n'))
console.log('\n\n\n---inside of loop----\n\n\n')
console.log(rawMap.map((col, row) => col.map((_, column) => sparseGround[row] && sparseGround[row][column] ? 'I' : '.').join('')).join('\n'))
console.log('\n\n\n------fancy map------\n\n\n')

console.log(
    rawMap.map((r, row) => r.map((char, column) => {
        if (isPathCoord({ row, column })) return fancyMap[char] || char
        if (sparseGround[row] && sparseGround[row][column]) return char === '.' ? ' ' : '.'

        return '▚'
    }).join('')).join('\n')
)

console.log('\n\n\n-----fancier map-----\n\n\n')

console.log(
    rawMap.map((r, row) => r.map((char, column) => {
        if (isPathCoord({ row, column })) return fancyMap[char] || char
        if (sparseGround[row] && sparseGround[row][column]) return severity[debugInefficienciesMap[row][column]]

        return ' '
    }).join('')).join('\n')
)
console.log(Object.keys(sparseGround).reduce((acc, k) => acc + Object.keys(sparseGround[k]).length, 0))

