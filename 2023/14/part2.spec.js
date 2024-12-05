const { readFileSync } = require("node:fs")
const { parseInput, cycleRocks } = require("./script-02")

describe("Part 2", () => {
  const exampleInput = readFileSync('./14/example.txt', { encoding: 'utf-8' })
  const boundX = exampleInput.split('\n')[0].length
  const boundY = exampleInput.split('\n').length
  it("cycles once correctly", () => {
    const { rollingRocks, stoppingRocks } = parseInput(exampleInput)
    const { rollingRocks: expected } = parseInput(readFileSync("./14/cycle-01.txt", { encoding: 'utf-8' }))

    const result = cycleRocks(rollingRocks, stoppingRocks, boundX, boundY)

    expect(result).toEqual(expected)
  })

  it("cycles twice correctly", () => {
    const { rollingRocks, stoppingRocks } = parseInput(exampleInput)
    const { rollingRocks: expected } = parseInput(readFileSync("./14/cycle-02.txt", { encoding: 'utf-8' }))

    const result1 = cycleRocks(rollingRocks, stoppingRocks, boundX, boundY)
    const result = cycleRocks(result1, stoppingRocks, boundX, boundY)

    expect(result).toEqual(expected)
  })

  it("cycles three times correctly", () => {
    const { rollingRocks, stoppingRocks } = parseInput(exampleInput)
    const { rollingRocks: expected } = parseInput(readFileSync("./14/cycle-03.txt", { encoding: 'utf-8' }))

    const result1 = cycleRocks(rollingRocks, stoppingRocks, boundX, boundY)
    const result2 = cycleRocks(result1, stoppingRocks, boundX, boundY)
    const result = cycleRocks(result2, stoppingRocks, boundX, boundY)

    expect(result).toEqual(expected)
  })
})
