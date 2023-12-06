const fs = require('fs')

const file = fs.readFileSync('./05/input.txt', { encoding: 'utf-8'})


const [seedsStr, _, ...rest] = file.split('\n')

const seedsRaw = seedsStr.slice('seeds: '.length).split(' ').map(s => parseInt(s))

/** @type {{start: number, end: number}} */
const seeds = seedsRaw.reduce((acc, s, i) => {
    if (i % 2 !== 0) return acc
    const total = seedsRaw[i + 1]
    return [...acc, { start: s, end: s + total - 1 }]
}, [])

// console.log(seedsRaw, seeds)

/**
 * @typedef {{ destinationStart: number, sourceStart: number, range: number }} Range
 * @typedef {{ from: string, to: string, ranges: Range[] }} SeedMap
 * */

/** @type {(mapStr: str) => SeedMap} */
const processMap = mapStr => {
    const [definition, ...ranges] = mapStr.split('\n').filter(l => l.length)

    const [from, _, to] = definition.split(' ')[0].split('-')
    return {
        from,
        to,
        ranges: ranges.map(r => {
            const [destinationStart, sourceStart, range] = r.split(' ').map(n => parseInt(n))
            return { destinationStart, sourceStart, range}
        })
    }
}
const maps = rest.join('\n').split('\n\n').map(processMap)

const starting = 'seed'

/** @type {(sourceNum: number, map: SeedMap) => number} */
const getDestination = (sourceNum, map) => {
    const ranges = map.ranges.filter(range => range.sourceStart <= sourceNum && (range.sourceStart + range.range) >= sourceNum)
    if (ranges.length === 0) return sourceNum

    const range = ranges.reduce((acc, range) => acc.destinationStart < range.destinationStart ? acc : range, ranges[0])
    return range.destinationStart + (sourceNum - range.sourceStart)
}

/** @type {{ [from: string]: SeedMap }} */
const mapOMaps = maps.reduce((acc, map) => ({ ...acc, [map.from]: map}), {})
// let from = starting
// let sourceNum = seeds[0]

/**
 * @type {{ start: number, end: number }[]}
 */
let sourceNums = [...seeds]

let min = Number.NaN

for (let index = 0; index < sourceNums.length; index++) {
    const sourceRange = sourceNums[index]
    console.log(sourceRange.end - sourceRange.start)
    let localMin = Number.NaN
    for (let i = sourceRange.start; i <= sourceRange.end; i++) {
        let from = starting
        let sourceNum = i
        while (mapOMaps[from] !== undefined) {
            const toMap = mapOMaps[from]
            const to = toMap.to

            from = to

            const destNum = getDestination(sourceNum, toMap)
            sourceNum = destNum
            // sourceNum = toNum
        }
        if (Number.isNaN(localMin) || localMin > sourceNum) localMin = sourceNum

    }
    if (Number.isNaN(min) || localMin < min) min = localMin
    console.log(`${index + 1}/${sourceNums.length}`)
}

console.log(min)
// console.log(sourceNums.reduce((min, next) => Number.isNaN(min) ? next : Math.min(min, next), Number.NaN))


