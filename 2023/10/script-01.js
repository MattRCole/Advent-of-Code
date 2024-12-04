const fs = require("node:fs")

const file = fs.readFileSync("./10/input.txt", { encoding: "utf-8" })

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

const Opposite = {
    North: 'South',
    South: 'North',
    East: 'West',
    West: 'East'
}
/** @typedef {keyof typeof Compass} Direction */

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

/** @type {{ [D in keyof typeof Compass]: string[] }} */
const connectsTo = Object.keys(connectorMap).reduce((acc, k) => {
    if (connectorMap[k].length === 0) return acc
    const toAdd = {}
    for (const compass of connectorMap[k]) {
        acc[compass] = acc[compass] ? [...acc[compass], k] : [k]
    }
    return acc
}, {})

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

let travelA = connectorMap[sPipeType][0]
let travelB = connectorMap[sPipeType][1]

let previousCoordsA = undefined
let previousCoordsB = undefined

let currentA = { ...sCoords }
let currentB = { ...sCoords }
let step = 0

/** @type {(coord: Coords, map: string[][]) => string} */
const connectorAtCoord = (coord, map = rawMap) => map[coord.row][coord.column]

while (previousCoordsA === undefined || (!areSameCoordinates(currentA, currentB) && !areSameCoordinates(currentA, previousCoordsB) && !areSameCoordinates(previousCoordsA, currentB))) {
    step++
    previousCoordsA = currentA
    previousCoordsB = currentB
    currentA = moveDirection(currentA, travelA)
    currentB = moveDirection(currentB, travelB)
    const connectorA = connectorAtCoord(currentA)
    const connectorB = connectorAtCoord(currentB)
    travelA = connectorMap[connectorA].filter(dir => Opposite[dir] !== travelA)[0]
    travelB = connectorMap[connectorB].filter(dir => Opposite[dir] !== travelB)[0]
}

console.log(step)

