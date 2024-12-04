const fs = require("node:fs")

const file = fs.readFileSync("./09/input.txt", { encoding: "utf-8" })

/** @type {number[]} */
const sequences = file.split('\n').filter(l => l.length).map(l => l.split(' ').map(n => parseInt(n)))

/** @type {(sequence: number[]) => number[]} */
const getDifference = sequence => sequence.reduce((acc, num, index) => index ? [...acc, num - sequence[index - 1]] : acc, [])


/** @type {(sequence: number[]) => boolean} */
const isAllZeros = sequence => {
    for (const item of sequence) if (item !== 0) return false

    return true
}

/** @type {number[][][]} */
const sequenceBreakdowns = []

for (const sequence of sequences) {
    let difference = getDifference(sequence)
    /** @type {number[][]} */
    let differences = [difference]

    while (!isAllZeros(difference)) {
        difference = getDifference(difference)
        differences.push(difference)
    }
    sequenceBreakdowns.push([sequence, ...differences])
}

/**
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
const lastItem = arr => arr[arr.length - 1]

/** @type {(arr: any[]) => number} */
const lastIndex = arr => arr.length - 1

/** @type {(sequence: number[], previousSequence: number[]) => number} */
const getNextNumber = (sequence, previousSequence) => lastItem(sequence) + lastItem(previousSequence)

for (const breakdown of sequenceBreakdowns) {
    for (let i = lastIndex(breakdown); i >= 0; i--) {
        const difference = breakdown[i]

        // this also works to check if we are dealing with the last difference in the array
        if (isAllZeros(difference)) {
            difference.push(0)
            continue
        }

        difference.push(getNextNumber(difference, breakdown[i + 1]))
    }

}
console.log(sequenceBreakdowns.reduce((acc, [sequence, ..._]) => acc + lastItem(sequence), 0))
