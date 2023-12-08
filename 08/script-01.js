const fs = require("node:fs")

const file = fs.readFileSync("./08/input.txt", { encoding: "utf-8" })

const [directionStr, _, ...nodeStrS] = file.split('\n')

const directions = directionStr.split('')

/** @type {{ [node: string]: { L: string, R: string }}} */
const nodes = nodeStrS.map(n => {
    const [name, directionStr] = n.split(' = ')
    const [L, R] = directionStr.split(', ').map(dir => dir.replace(/[()]/g, ''))
    return {
        name,
        L,
        R
    }
})
const nodeMap = nodes.reduce((acc, node) => ({...acc, [node.name]: { L: node.L, R: node.R }}), {})

let currentNode = 'AAA'
let steps = 0

while (currentNode !== 'ZZZ') {
    const instruction = directions[steps % directions.length]
    currentNode = nodeMap[currentNode][instruction]
    steps++
}

console.log(steps)
