const fs = require("node:fs")
const arr = require('../util/array')

/** @type {(file: string) => string[]} */
const parseInput = file => file.split(',')

/** @type {(toHash: string) => number} */
const doHASH = toHash => {
  let currentValue = 0
  for (const c of toHash) {
    const asciiCode = c.charCodeAt(0)
    currentValue += asciiCode
    currentValue *= 17
    currentValue = currentValue % 256
  }
  return currentValue
}

const main = () => {
  const file = fs.readFileSync("./15/input.txt", { encoding: "utf-8" })
  const input = parseInput(file)

  const results = input.reduce((acc, word) => ({ ...acc, [word]: [...(acc[word] || []), doHASH(word)] }), {})
  console.log(results)

  console.log({ result: arr.sum(Object.values(results).map(arr.sum)) })

}

if (require.main === module) {
  main()
}

module.exports = {
  doHASH
}
