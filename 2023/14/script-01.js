const fs = require("node:fs")

const arr = require('../util/array')

const ROLLING_ROCK = 'O'
const STOPPING_ROCK = '#'

/** @type {(file: string) => string[][]} */
const getInput = file => file.split("\n").map(l => l.split(''))

/**
 * This will "orient" the input with the given direction as "DOWN"
 * For picturing this, imagine that you're standing looking at the mirror with lowest (down) side closest to you
 * and the highest (up) side furthest from you.
 * The output of the function will have index (0,0) be the furthest left corner from you.
 *
 * Since this is a two dimensional array, there are two indexes. The first index refers to
 * columns. IE: index (0,x) refers to the "left most" column, index (x, 0) represents the furthest most row
 * (all from the point of view described above)
 * Example: given the input
 *      (you stand here, looking in this direction)
 *      ( vvvvvvvvvvvvvvvvvvvv )
 * [
 *   ['x', '0', 'y'],
 *   ['1', 'z', '2'],
 *   ['a', '3', 'b'],
 * ]
 * 
 * and the direction 'north':
 * the resulting array would be:
 * 
 * [
 *   ['b', '2', 'y'],
 *   ['3', 'z', '0'],
 *   ['a', '1', 'x']
 * ]
 * @type {(input: string[][], direction: 'north' | 'south' | 'east' | 'west')}
 */
const orientInput = (input, direction) => {
  if (direction === "east") return arr.reverse(input)

  if (direction === "west") return input.map(col => arr.reverse(col))

  const rowColumnFlipped = arr.zip(...input)

  if (direction === "north") return arr.reverse(rowColumnFlipped.map(row => arr.reverse(row)))

  return rowColumnFlipped
}

/** @type {(orientedInput: string[][]) => number} */
const getLoadAfterRockShift = orientedInput => {
  const computeLoad = (stoppingIndex, rollingRockCount) => rollingRockCount === 0 ? 0 : arr.sum((new Array(rollingRockCount)).fill(0).map((_, i) => stoppingIndex - i))
  let load = 0
  for(let columnIndex = 0; columnIndex < orientedInput.length; columnIndex++) {
    let rollingRockCount = 0
    const row = orientedInput[columnIndex]
    for(let rowIndex = 0; rowIndex < row.length; rowIndex++) {
      const val = row[rowIndex]
      if (val === ROLLING_ROCK) {
        rollingRockCount += 1
      } else if (val === STOPPING_ROCK) {
        const computedLoad = computeLoad(rowIndex, rollingRockCount)
        // console.log({ computedLoad, rollingRockCount, rowIndex, load, val, row, columnIndex })
        load += computedLoad
        rollingRockCount = 0
      }
    }
    load += computeLoad(row.length, rollingRockCount)
  } 
  return load
}

const logInput = input => console.log(input.map(r => r.join('')).join('\n'))
const main = () => {
  const file = fs.readFileSync("./14/input.txt", { encoding: "utf-8" })
  const input = getInput(file)

  console.log(getLoadAfterRockShift(orientInput(input, "north")))

}

if (require.main === module) {
  main()
}


module.exports = {
  orientInput,
  getLoadAfterRockShift,
}