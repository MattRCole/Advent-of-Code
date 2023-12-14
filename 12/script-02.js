const fs = require("node:fs")
const lib = require('./lib')

const file = fs.readFileSync("./12/input.txt", { encoding: "utf-8" })

/** @typedef {import('./lib').Case} Case*/

/** @type {Case[]} */
const part2BaseCases = file.split('\n').map(l => {
    const [rawLine, checkSumStr] = l.split(' ')
    const checkSums = new Array(5).fill(checkSumStr).join(',').split(',').map(n => parseInt(n))
    const groups = new Array(5).fill(rawLine).join('?').split('.').filter(({ length }) => length).map(l => l.split(''))

    return {
        checkSums,
        groups: groups.filter(({ length }) => length > 0),
        permutations: 1,
    }
})

/** @type {Case[]} */
const part1BaseCases = file.split('\n').map(l => {
    const [rawLine, checkSumStr] = l.split(' ')
    const checkSums = checkSumStr.split(',').map(n => parseInt(n))
    const groups = rawLine.split('.').filter(({ length }) => length).map(l => l.split(''))

    return {
        checkSums,
        groups: groups.filter(({ length }) => length > 0),
        permutations: 1,
    }
})

const baseCases = part2BaseCases

let results = 0

for (let baseCaseIndex = 0; baseCaseIndex < baseCases.length; baseCaseIndex++) {
  console.log(baseCaseIndex + 1)

  const baseCase = baseCases[baseCaseIndex]
  
  
  const lineResults = lib.solveBaseCase(baseCase)
  results += lineResults
}

console.log('result: ', results)
