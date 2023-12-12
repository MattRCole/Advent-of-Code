/** @type {(arr: number[]) => number} */
const sum = arr => arr.reduce((acc, num) => acc + num, 0)

/** @type {(arr: number[]) => number} */
const multiply = arr => arr.reduce((acc, num) => acc * num, 1)

/** @type {<T>(arr: T[]) => T[]} */
const reverse = arr => [...arr].reverse()

/** @type {(arr: any[]) => number} */
const lastIndex = ({ length }) => length - 1

/** @type {<T>(arr: T[]) => T} */
const last = arr => arr[lastIndex(arr)]

/** @type {<T>(arr: T[], index: number, deleteCount: number, ...newItems: T[]) => T[]} */
const splice = (arr, index, deleteCount, ...newItems) => [...arr.slice(0, index), ...newItems, ...arr.slice(index + deleteCount)]

module.exports = {
    sum,
    multiply,
    lastIndex,
    last,
    lastIndex,
    reverse,
    splice,
}


