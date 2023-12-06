const fs = require('fs')

const file = fs.readFileSync('./01/input.txt', { encoding: 'utf-8' })
const lines = file.split('\n')

const wordNumbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

/** @type {(partialLine: string) => number} */
const findNumberFromStart = partialLine => {
    if (!partialLine.length) return Number.NaN

    const easyRoute = parseInt(partialLine[0])
    if (!Number.isNaN(easyRoute)) return easyRoute

    for (let i = 0; i < wordNumbers.length; i++) {
        const wordNumber = wordNumbers[i]
        if (partialLine.startsWith(wordNumber)) return i
    }
    return NaN
}

/** @type {(line: string) => number} */
const getNumber = line => {
    
    const numbers = []
    for (let offset = 0; offset < line.length; offset++) {
        const partialLine = line.slice(offset)
        const result = findNumberFromStart(partialLine)

        if (Number.isNaN(result)) continue

        numbers.push(result)
    }
    const finalResult =  parseInt(`${numbers[0]}${numbers[numbers.length - 1]}`)

    return finalResult
}

/** @type {(lines: string[]) => number[]} */
const getNumbers = lines => lines.map(l => getNumber(l))

const numbers = getNumbers(lines)

const sum = numbers.reduce((a, n) => a + n, 0)

console.log(sum)
