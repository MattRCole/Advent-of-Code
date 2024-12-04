const fs = require("node:fs")

const arr = require('../util/array')
const { rejects } = require("node:assert")


/** @type {(f: string) => string[][]} */
const parseFile = f => f.split('\n\n').map(m => m.split('\n'))

/** @type {(terrainMap: string[]) => { rows: number[], columns: [] }} */
const getCheckSums = terrainMap => {
  const rows = new Array(terrainMap.length).fill(0)
  const columns = new Array(terrainMap[0].length).fill(0)
  for (let row = 0; row < rows.length; row++) {
    for (let column = 0; column < columns.length; column++) {
      if (terrainMap[row][column] === '.') continue

      rows[row]++
      columns[column]++
    }
  }
  return { rows, columns }
}

/** @type {(checkSums: number[]) => number[]} */
const getPreliminaryTestIndexes = checkSums => {
  const response = []
  let revStack = []
  for (let i = 0; i < checkSums.length; i++) {
    const checkSum = checkSums[i]
    if (i === 0) {
      revStack = [checkSum, ...revStack]
      continue
    }

    let offset = 0
    let isValid = true
    while (true){
      if (i+offset >= checkSums.length || offset >= revStack.length ) {
        break
      }

      if (revStack[offset] !== checkSums[i + offset]) {
        isValid = false
        break
      }
      offset++
    }

    revStack = [checkSum, ...revStack]

    if (isValid) response.push(i)
  }

  return response
}

/** @type {(row: number, terrainMap: string[]) => boolean} */
const testAlongRow = (row, terrainMap) => {
  const reversed = terrainMap.slice(0, row).reverse()
  const rest = terrainMap.slice(row)

  for (let rowIndex = 0; rowIndex < Math.min(reversed.length, rest.length); rowIndex++) {
    const revRow = reversed[rowIndex]
    const restRow = rest[rowIndex]
    if (revRow !== restRow) return false
  }

  return true
}

/** @type {(str: string) => string} */
const reverse = str => str.split('').reverse().join('')

/** @type {(column: number, terrainMap: string[]) => boolean} */
const testAlongColumn = (column, terrainMap) => {
  const length = Math.min(column, terrainMap[0].length - column)

  for (let rowIndex = 0; rowIndex < terrainMap.length; rowIndex++) {
    const row = terrainMap[rowIndex]
    const reversed = reverse(row.slice(column - length, column))
    const rest = row.slice(column, column + length)

    if (reversed !== rest) return false
  }

  return true
}

/** @type {(terrainMap: string[], stopAtFirstResult: boolean = true) => { rows: number[], columns: number[] }} */
const solveTerrainMapWithInfo = (terrainMap, stopAtFirstResult = true) => {
  const { rows, columns } = getCheckSums(terrainMap)
  const prelimRows = getPreliminaryTestIndexes(rows)
  const prelimColumns = getPreliminaryTestIndexes(columns)

  const reflectionRows = []

  const reflectionColumns = []
  for (let rowIndex = 0; rowIndex < prelimRows.length; rowIndex++) {
    const row = prelimRows[rowIndex]
    if (testAlongRow(row, terrainMap) === false) continue

    reflectionRows.push(row)
    if (stopAtFirstResult) return { rows: reflectionRows, columns: [] }
  }

  for (let columnIndex = 0; columnIndex < prelimColumns.length; columnIndex++) {
    const column = prelimColumns[columnIndex]
    if (testAlongColumn(column, terrainMap) === false) continue

    reflectionColumns.push(column)
    if (stopAtFirstResult) return { rows: reflectionRows, columns: reflectionColumns }
  }

  return { rows: reflectionRows, columns: reflectionColumns }
}

/** @type {(terrainMap: string[]) => number} */
const solveTerrainMap = terrainMap => {
  const { rows, columns } = solveTerrainMapWithInfo(terrainMap)
  return (arr.sum(rows) * 100) + arr.sum(columns)
}

const main = () => {
  const file = fs.readFileSync("./13/input.txt", { encoding: "utf-8" })

  const terrainMaps = parseFile(file)

  console.log(arr.sum(terrainMaps.map(tm => solveTerrainMap(tm))))
}

if (require.main === module) {
  main()
}

module.exports = {
  parseFile,
  getCheckSums,
  getPreliminaryTestIndexes,
  solveTerrainMap,
  solveTerrainMapWithInfo,
  testAlongColumn,
  testAlongRow,
}
