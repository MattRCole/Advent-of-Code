const fs = require('fs')

const file = fs.readFileSync('./03/input.txt', { encoding: 'utf-8'})

const symbol = 'S'

const empty = 'E'

class PartNumberPart {
    constructor(index, columnIndex, rowIndex, completePartNumber) {
        this.index = index,
        this.column = columnIndex
        this.row = rowIndex
        this.completePartNumber = completePartNumber
    }
}

/** @type {(index: number, line: string, rowIndex: number) => PartNumberPart} */
const getNumber = (index, line, rowIndex) => {
    const reversedSubstring = line.slice(0, index).split('').reverse().join('')
    let indexOffset = 0
    while (indexOffset < reversedSubstring.length && !Number.isNaN(parseInt(reversedSubstring[indexOffset]))) indexOffset++

    const startingIndex = index - indexOffset

    const match = line.slice(startingIndex).match(/\d+/)
    if (!match) throw new Error(`Could not parse out number at index: ${index}, computed startingIndex: ${startingIndex}, complete line: "${line}"`)

    return new PartNumberPart(index, startingIndex, rowIndex, parseInt(match[0]))
}

/** @type {(item: string, index: number, line: string, rowIndex: string) => Symbol | PartNumberPart} */
const parseOutItem = (item, index, line, rowIndex) => {
    const result = Number.isNaN(parseInt(item))
    ? (item === '.' ? empty : symbol)
    : getNumber(index, line, rowIndex)

    return result
}

const grid = file.split('\n').map((l, rowIndex) => l.split('').map((item, index) => parseOutItem(item, index, l, rowIndex)))

/** @typedef {{ row: number, column: number }} Coordinate */
/**
 * @template T
 * @param {(acc: T, item: string | PartNumberPart, coordinate: Coordinate) => T} callback 
 * @param {(string | PartNumberPart)[][]} grid 
 * @param {number} row 
 * @param {number} column 
 * @returns {T}
 */
const reduceNeighbors = (callback, grid, row, column, initialAcc) => {
    const rowIndexes = [row - 1, row, row + 1].filter(i => i >= 0 && i < grid.length)
    const columnIndex = [column - 1, column, column + 1].filter(i => i >= 0 && i < grid[row].length)
    /** @type {Coordinate[]} */
    const coordinatesToVisit = rowIndexes.reduce((acc, r) => {
        return [...acc, ...columnIndex.map(c => ({ row: r, column: c }))]
    }, []).filter(coord => coord.row !== row || coord.column !== column)

    let acc = initialAcc
    for (let coordinate of coordinatesToVisit) {
        acc = callback(acc, grid[coordinate.row][coordinate.column], coordinate)
    }
    return acc
}

/** @typedef {{ num: number, row: number, column: number }} PartNumber */

/** @type {PartNumber[]} */
let partNumbers = []

/** @typedef {(a: Coordinate, b: Coordinate) => boolean} */
const coordsAreEqual = (a, b) => a.row === b.row && a.column === b.column

for (let row = 0; row < grid.length; row++) {
    for (let column = 0; column < grid[row].length; column++) {
        if (grid[row][column] !== symbol) continue

        partNumbers = reduceNeighbors((acc, item) => {
            if (!(item instanceof PartNumberPart)) return acc


            const existingIndex = acc.findIndex((coords) => coordsAreEqual(item, coords))

            if (existingIndex >= 0) return acc

            return [...acc, { num: item.completePartNumber, row: item.row, column: item.column }]
        }, grid, row, column, partNumbers)
    }
}

console.log(partNumbers.reduce((acc, { num }) => acc + num, 0))
