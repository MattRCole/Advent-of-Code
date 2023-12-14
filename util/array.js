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

/** @type {<T>(arr: T[], options: { item?: T, predicate?: (test: T) => any }) => boolean} */
const any = (arr, { item, predicate } = { item: undefined, predicate: undefined }) => {
    if (item === undefined && predicate === undefined) throw new Error(`Cannot search array without item or predicate arr: ${arr}`)

    if (item !== undefined && predicate !== undefined) throw new Error(`Cant handle both an item and a predicate option, just one or the other please. arr: ${arr}, item: ${item}, predicate: ${predicate}`)

    for (const thing of arr) {
        if (item !== undefined && Object.is(thing, item))  return true

        if (predicate !== undefined && predicate(thing)) return true
    }

    return false
}

module.exports = {
    sum,
    multiply,
    lastIndex,
    last,
    lastIndex,
    reverse,
    splice,
    any,
}


