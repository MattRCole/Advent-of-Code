const fs = require("node:fs")
const lib = require('./lib')
const arr = require('../util/array')

const file = fs.readFileSync("./12/input.txt", { encoding: "utf-8" })

/** @typedef {{ checkSums: number[], groups: string[][], rawLine: string }} HotSpringLine */

/** @type {HotSpringLine[]} */
const newHotSpringsLines = file.split('\n').map(l => {
    const [rawLine, checkSumStr] = l.split(' ')
    const checkSums = new Array(5).fill(checkSumStr).join(',').split(',').map(n => parseInt(n))
    const groups = new Array(5).fill(rawLine).join('?').split('.').filter(({ length }) => length).map(l => l.split(''))

    return {
        rawLine: l,
        checkSums,
        groups: groups.filter(({ length }) => length > 0)
    }
})

/** @type {HotSpringLine[]} */
const oldHotSpringsLines = file.split('\n').map(l => {
    const [rawLine, checkSumStr] = l.split(' ')
    const checkSums = checkSumStr.split(',').map(n => parseInt(n))
    const groups = [[]]
    let currentGroup = 0
    for (let i = 0; i < rawLine.length; i++) {
        const char = rawLine[i]
        if (char === '.' && (i === 0 || rawLine[i - 1] === '.')) continue

        if (char === '.') {
            currentGroup++
            groups.push([])
            continue
        }

        groups[currentGroup].push(char)
    }

    return {
        rawLine,
        checkSums,
        groups: groups.filter(({ length }) => length > 0)
    }
})

const hotSpringsLines = newHotSpringsLines

/** @typedef {import('./lib').Case} Case*/

/** @type {Case[]} */
const lines = hotSpringsLines.map(({ groups, checkSums }) => ({ groups, checkSums, permutations: 1 }))

const results = []

for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
  /** @type {Case[]} */
  console.log(lineIndex + 1)
  const line = lines[lineIndex]
  
  
  const lineResults = lib.solveBaseCase(line)
  results.push(lineResults)
}

console.log(arr.sum(results))
