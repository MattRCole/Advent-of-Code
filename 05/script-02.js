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

/**
 * @typedef {{ start: number, end: number }} Range
 * @typedef {{ from: string, to: string, ranges: { source: Range, dest: Range }[] }} RangeMap
 * */

/** @type {(mapStr: str) => RangeMap} */
const processMap = mapStr => {
    const [definition, ...ranges] = mapStr.split('\n').filter(l => l.length)

    const [from, _, to] = definition.split(' ')[0].split('-')
    return {
        from,
        to,
        ranges: ranges.map(r => {
            const [destinationStart, sourceStart, range] = r.split(' ').map(n => parseInt(n))
            return { source: { start: sourceStart, end: (sourceStart - 1) + range }, dest: { start: destinationStart, end: (destinationStart - 1) + range } }
        })
    }
}
const maps = rest.join('\n').split('\n\n').map(processMap)

/** @type {{ [from: string]: RangeMap }} */
const mapOMaps = maps.reduce((acc, map) => ({ ...acc, [map.from]: map}), {})

/**
 * @type {(range: Range, rangeMap: RangeMap) => RangeMap['ranges']}
 */
const getOverlappingRanges = (range, rangeMap) => rangeMap.ranges.filter(({ source }) => !(source.end < range.start || source.start > range.end))


/** @type {(ogRange: Range, overlappingRanges: RangeMap['ranges']) => RangeMap['ranges']} */
const getRangeBreakdown = (ogRange, overlappingRanges) => {
    const sortedRanges = overlappingRanges.slice(0).sort(({ source: { start: a }}, { source: { start: b }}) => a - b)
    let nextUnhandledRange = ogRange.start
    /** @type {RangeMap['ranges']} */
    const rangeBreakdown = []
    for (const { source, dest } of sortedRanges) {
        const startAt = source.start < nextUnhandledRange ? nextUnhandledRange : source.start
        const endAt = ogRange.end < source.end ? ogRange.end : source.end
        if (startAt > nextUnhandledRange) {
            rangeBreakdown.push({ source: { start: nextUnhandledRange, end: startAt - 1 }, dest: { start: nextUnhandledRange, end: startAt - 1 } })
        }

        rangeBreakdown.push({
            source: { start: startAt, end: endAt },
            dest: {
                start: dest.start + (startAt > source.start ? Math.abs(source.start - startAt) : 0),
                end: dest.end - (endAt < source.end ? Math.abs(source.end - endAt) : 0),
            },
        })

        nextUnhandledRange = endAt + 1

    }
    if (nextUnhandledRange < ogRange.end) {
        rangeBreakdown.push({
            source: { start: nextUnhandledRange, end: ogRange.end },
            dest: { start: nextUnhandledRange, end: ogRange.end },
            isAddIn: true
        })
    }
    return rangeBreakdown

}


/**
 * @type {{ from: string, range: Range }[]}
 */
const queue = seeds.map(r => ({ from: 'seed', range: r }))

/** @type {number[]} */
const results = []

for (let i = 0; i < queue.length; i++) {
    const { from, range } = queue[i]
    const rangeMap = mapOMaps[from]
    if (rangeMap == undefined) {
        results.push(range.start)
        continue
    }
    const overlappingRanges = getOverlappingRanges(range, rangeMap)
    const rangeBreakdowns = getRangeBreakdown(range, overlappingRanges)
    queue.push(...rangeBreakdowns.map(({ dest }) => ({ from: rangeMap.to, range: dest })))
}

console.log(results.reduce((acc, n) => Number.isNaN(acc) ? n : Math.min(acc, n), Number.NaN))
