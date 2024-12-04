const fs = require("node:fs")

const file = fs.readFileSync("./11/input.txt", { encoding: "utf-8" })

const rawMap = file.split('\n').map(l => l.split(''))

/** @typedef {{ row: number, column: number }} Coords */

const _rowsWithGalaxies = {}
const _columnsWithGalaxies = {}
/** @type {{ [row: string]: { [column: string]: number } }} */
/** @type {Coords[]} */
const galaxyCoords = []

for (let row = 0; row < rawMap.length; row++) {
    for (let column = 0; column < rawMap[0].length; column++) {
        if (rawMap[row][column] === '.') continue

        _rowsWithGalaxies[row] = true
        _columnsWithGalaxies[column] = true
        // sparseGalaxy[row] = { ...(sparseGalaxy[row] || {}), [column]: galaxyCoords.length }
        // galaxyCoords.push({ row, column })
    }
}


const rowsWithoutGalaxies = rawMap.map((_, row) => _rowsWithGalaxies[row] ? undefined : row).filter(r => r !== undefined)
const columnsWithoutGalaxies = rawMap[0].map((_, column) => _columnsWithGalaxies[column] ? undefined : column).filter(c => c !== undefined)

/** @type {(originalRow: string[]) => string[]} */
const makeRowWithExpandedColumns = originalRow => originalRow.reduce((acc, char, column) => columnsWithoutGalaxies.includes(column) ? [...acc, '.', char] : [...acc, char], [])

const getFillerRow = () => new Array(rawMap[0].length + columnsWithoutGalaxies.length).fill('.')

const galaxyMap = rawMap.reduce((acc, l, row) => {
    if (rowsWithoutGalaxies.includes(row)) return [...acc, getFillerRow(), makeRowWithExpandedColumns(l)]

    return [...acc, makeRowWithExpandedColumns(l)]
}, [])

galaxyMap.forEach((r, row) => {
    r.forEach((char, column) => {
        if (char === '.') return

        galaxyCoords.push({ row, column })
    })
})

// const condenseMap = m => m.map(l => l.join('')).join('\n')

/** @type {(a: Coords, b: Coords) => number} */
const getDistanceBetweenCoords = (a, b) => Math.abs(a.row - b.row) + Math.abs(a.column - b.column)

/** @type {number[]} */
const allDistances = galaxyCoords.reduce((acc, coords, index) => {
    return [...acc, ...galaxyCoords.slice(index + 1).map(c => getDistanceBetweenCoords(coords, c))]
}, [])

console.log(allDistances.reduce((acc, d) => acc + d, 0))