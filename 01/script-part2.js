const fs = require('fs')

const file = fs.readFileSync('./01/input.txt', { encoding: 'utf-8' })
const lines = file.split('\n')

const wordNumbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']

/**
 * @typedef {{ charactersConsumed: number, result: number }} FindNumberResult
 */

/** @type {(partialLine: string) => FindNumberResult} */
const findNumberFromStart = partialLine => {
    if (!partialLine.length) return { result: Number.NaN, charactersConsumed: 0 }
    const easyRoute = parseInt(partialLine[0])
    if (!Number.isNaN(easyRoute)) return { result: easyRoute, charactersConsumed: 1 }

    // let potentialWords = [...wordNumbers]
    // let index = 0

    for (let i = 0; i < wordNumbers.length; i++) {
        const wordNumber = wordNumbers[i]
        if (partialLine.startsWith(wordNumber)) return { result: i, charactersConsumed: wordNumber.length}
    }
    // while (potentialWords.length > 0) {
    //     const entriesToRemove = potentialWords.filter(n => index >= n.length || partialLine[index] !== n[index])
    //     for (let entry of entriesToRemove) {
    //         potentialWords.splice(potentialWords.indexOf(entry), 1)
    //     }
    //     const lineSoFar = partialLine.slice(0, index + 1)

    //     console.log(`lineSoFar: ${lineSoFar}, index: ${index}, removed the following numbers: ${entriesToRemove.join(', ')}`)

    //     const exactMatches = potentialWords.filter(n => n === lineSoFar)

    //     if (exactMatches.length) return { result: wordNumbers.indexOf(exactMatches[0]), charactersConsumed: index + 1 }

    //     index += 1
    // }

    return { result: Number.NaN, charactersConsumed: 1 }
}

/** @type {(line: string) => number} */
const getNumber = line => {
    let offset = 0
    const numbers = []
    // console.log(JSON.stringify({ }))
    while (offset < line.length) {
        const partialLine = line.slice(offset)
        const { result, charactersConsumed } = findNumberFromStart(partialLine)
        if (!Number.isNaN(result)) {
            console.log(JSON.stringify({ result, charactersConsumed, partialLine }))
            numbers.push(result)
        }
        offset += 1
    }
    // const onlyNumbers = line.split('').filter(c => !Number.isNaN(parseInt(c)))
    const finalResult =  parseInt(`${numbers[0]}${numbers[numbers.length - 1]}`)
    console.log(JSON.stringify({ finalResult, numbers, line }))

    return finalResult
}

/** @type {(lines: string[]) => number[]} */
const getNumbers = lines => lines.map(l => getNumber(l))

const numbers = getNumbers(lines)

const sum = numbers.reduce((a, n) => a + n, 0)

console.log(sum)

// module.exports = {
//     findNumberFromStart
// }
