const fs = require('fs')

const file = fs.readFileSync('./01/input.txt', { encoding: 'utf-8' })
const lines = file.split('\n')


/** @type {(line: string) => number} */
const getNumber = line => {
    const onlyNumbers = line.split('').filter(c => !Number.isNaN(parseInt(c)))
    return parseInt(`${onlyNumbers[0]}${onlyNumbers[onlyNumbers.length - 1]}`)
}

/** @type {(lines: string[]) => number[]} */
const getNumbers = lines => lines.map(l => getNumber(l))

const numbers = getNumbers(lines)

const sum = numbers.reduce((a, n) => a + n, 0)

console.log(sum)
