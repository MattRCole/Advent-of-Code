const fs = require("node:fs")

const file = fs.readFileSync("./08/input.txt", { encoding: "utf-8" })

const [directionStr, _, ...nodeStrS] = file.split('\n')

const directions = directionStr.split('')

/**
 * @type {{ name: string, L: string, R: string }[]}
 */
const nodes = nodeStrS.map(n => {
    const [name, directionStr] = n.split(' = ')
    const [L, R] = directionStr.split(', ').map(dir => dir.replace(/[()]/g, ''))
    return {
        name,
        L,
        R
    }
})
/** @type {{ [node: string]: { L: string, R: string }}} */
const nodeMap = nodes.reduce((acc, node) => ({...acc, [node.name]: { L: node.L, R: node.R }}), {})

// let currentNode = 'AAA'
let currentNodes = nodes.filter(({ name }) => name[name.length - 1] === 'A').map(({ name }) => name)
// let steps = 0

const allAreEndingNodes = () => {
    for (const node of currentNodes) {
        if (node[node.length - 1] !== 'Z') return false
    }
    return true
}

const cycleStepCounts = []

const isPrime = (candidate, ...primes) => {
    for (const prime of primes) {
        if (candidate % prime === 0) return false
    }
    return true
}
const nextBiggestPrime = (...primes) => {
    if (primes.length === 0) return 2

    let next = primes[primes.length - 1] + 1
    while (!isPrime(next, ...primes)) next++
    return next
}

const lcm = (...nums) => {
    let primes = []
    let usedPrimes = []
    let factoredNums = [...nums]
    while (factoredNums.indexOf(1) === factoredNums.lastIndexOf(1)) {
        const nextPrime = nextBiggestPrime(...primes)
        primes.push(nextPrime)
        let primeWasUsed = false
        factoredNums = factoredNums.map(n => {
            if (n % nextPrime === 0) {
                primeWasUsed = true
                return n / nextPrime
            }

            return n
        })
        if (primeWasUsed)  usedPrimes.push(nextPrime)
    }
    return [...usedPrimes, ...factoredNums].reduce((acc, n) => acc * n, 1)
}

for (let i = 0; i < currentNodes.length; i++) {
    const originalNode = currentNodes[i]
    let currentNode = currentNodes[i]
    let endingNode = undefined
    let firstEnding = 0
    let forceContinue = false
    let step = 0
    do {
        forceContinue = false
        const instruction = directions[step % directions.length]
        currentNode = nodeMap[currentNode][instruction]
        step++
        if (currentNode[currentNode.length - 1] === 'Z' && endingNode === undefined) {
            endingNode = currentNode
            firstEnding = step
            forceContinue = true
        }
    } while (currentNode !== endingNode || forceContinue)
    cycleStepCounts.push(firstEnding)
}

const answer = lcm(...cycleStepCounts)
console.log(answer)

// while (!allAreEndingNodes()) {
//     const instruction = directions[steps % directions.length]
//     currentNodes = currentNodes.map(node => nodeMap[node][instruction])
//     steps++
//     if (steps % 10000 === 0) console.log(steps)
// }

// console.log(steps)
