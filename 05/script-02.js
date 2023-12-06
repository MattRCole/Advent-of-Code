const fs = require('fs')

const file = fs.readFileSync('./05/example.txt', { encoding: 'utf-8'})


const [seedsStr, _, ...rest] = file.split('\n')

const seedsRaw = seedsStr.slice('seeds: '.length).split(' ').map(s => parseInt(s))

/** @type {{start: number, end: number}} */
const seeds = seedsRaw.reduce((acc, s, i) => {
    if (i % 2 !== 0) return acc
    const total = seedsRaw[i + 1]
    return [...acc, { start: s, end: s + total - 1 }]
}, [])

// console.log(seedsRaw, seeds)

// process.exit(0)


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

/** @type {(sourceNum: {start: number, end: number}, map: SeedMap) => { start: number, end: number }} */
const getDestinations = (sourceRange, map) => {
    const ranges = map.ranges.filter(range => {
        const rangeEnd = range.sourceStart + range.range
        if (range.sourceStart > sourceRange.end) return false
        if (rangeEnd < sourceRange.start) return false

        return true
    }).sort(({ start }) => start)

    if (ranges.length === 0) return [sourceRange]
    const destRanges = ranges.reduce((acc, range, index) => {
        const rangeEnd = range.sourceStart + range.range
        const biggestStart = Math.max(range.sourceStart, sourceRange.start)
        const smallestEnd = Math.min(rangeEnd, sourceRange.end)

        // will be <= 0, so we take abs
        const startOffset = Math.abs(range.sourceStart - biggestStart)

        const newRange = smallestEnd - biggestStart
        const newStart = range.destinationStart + startOffset

        // console.log({ rangeEnd, rangeStart: range.sourceStart,biggestStart, smallestEnd, newRange, newStart, sourceRange,  range })

        const part1 = { start: newStart, end: newStart + newRange }


        const skipPart2 = index + 1 >= ranges.length || rangeEnd + 1 >= ranges[index + 1].sourceStart

        const part2 = skipPart2 ? undefined : {
            start: rangeEnd + 1,
            end: ranges[index + 1].sourceStart - 1
        }
        if (!skipPart2) {
            console.log("adding range", part2)
        }

        return [...acc, part1, ...(part2 ? [part2] : [])]
        // return [[...srcAcc, { start: biggestStart, end: smallestEnd }], [
        //     ...acc,
            
        // ]]
    }, [])// [[],[]])

    // console.log({ sourceRanges, destRanges })
    return destRanges
}

/** @type {{ [from: string]: SeedMap }} */
const mapOMaps = maps.reduce((acc, map) => ({ ...acc, [map.from]: map}), {})
let from = starting

let sourceNums = [...seeds]
// let sourceNums = [seeds[0]]

while (mapOMaps[from] !== undefined) {
    const toMap = mapOMaps[from]
    const to = toMap.to

    const destNums = sourceNums.map(sourceNum => getDestinations(sourceNum, toMap)).reduce((acc, ns) => [...acc, ...ns], [])

    from = to

    sourceNums = destNums
    // sourceNum = toNum
    // break
}


console.log(sourceNums.reduce((min, next) => min === undefined ? next : min.start < next.start ? min : next, undefined))


