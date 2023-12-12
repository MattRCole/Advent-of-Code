const fs = require("node:fs")

const file = fs.readFileSync("./12/input.txt", { encoding: "utf-8" })

const arr = require('../util/array')

/** @typedef {{ checkSums: number[], groups: string[][], rawLine: string }} HotSpringLine */

const logInvalidExit = (...args) => devLog('[Invalid]:  ', ...args)
const logValid = (...args) =>       devLog('[Valid]:    ', ...args)
const logContinue = (...args) =>    devLog('[Continue]: ', ...args)

// const devLog = (...args) => console.log(...args)
const devLog = () => {}


/** @type {HotSpringLine[]} */
const hotSpringLines = file.split('\n').map(l => {
    const [rawLine, checkSumStr] = l.split(' ')
    const checkSums = checkSumStr.split(',').map(n => parseInt(n))
    const groups = [[]]
    let currentGroup = 0
    for (let i = 0; i < rawLine.length; i++) {
        const char = rawLine[i]
        if (char === '.' && (i === 0 || rawLine[i - 1] === '.')) continue

        if (char === '.') {
            currentGroup++
            groups.push([])
            continue
        }

        groups[currentGroup].push(char)
    }

    return {
        rawLine,
        checkSums,
        groups: groups.filter(({ length }) => length > 0)
    }
})

// console.log(hotSpringLines, hotSpringLines.map(({ rawLine, groups }) => [rawLine, ...groups]))
let branchCount = 0

/** @type {(remainingCheckSums: number[], remainingGroups: string[][], checkSumStarted: boolean) => number} */
const recursiveGroupCount = (remainingCheckSums, remainingGroups, checkSumStarted = false) => {
    devLog(JSON.stringify({ remainingCheckSums, remainingGroups, checkSumStarted }))
    // RULES:
    // - NO ZERO CHECK SUMS! This just must not happen!!! There are too many fiddly things that can happen!
    // - NO EMPTY GROUPS!!!!
    // we need to cover our base cases
    // this can be really complex, but there are basically 2 valid endings:
    // if there are no checkSums left, and if the only remaining characters in all groups are ?
    if (remainingCheckSums.length === 0) {
        const isInvalid = remainingGroups.map(g => g.join('')).join('').includes('#')
        if (isInvalid) {
            logInvalidExit('There are more for sure broken springs, but no more checksums')
            return 0
        }
        logValid('There are no more check-sums, and the remaining groups dont have explicit broken springs')
        return 1
    }
    // okay, this is the tricky part

    // some preliminary checks that will make stuff later easier:
    // If there are no more remaining groups, we obviously have a problem (see rule 1 for why we can do this)
    if (remainingGroups.length === 0) {
        logInvalidExit('There are no more remaining groups, but there are remaining check sums')
        return 0
    }
    // so, we have a check sum to work through, we are just gonna say this is the first checkSum in the remainingCheckSums list

    const currentCheckSum = remainingCheckSums[0]
    const currentGroup = remainingGroups[0]
    const currentChar = currentGroup[0]
    devLog({ currentGroup, currentCheckSum })
    if (Number.isNaN(currentCheckSum)) throw new Error('AAAAA')

    // Special edge case: we can just defer if the checksum hasn't been started and the current character is a questionmark, so let's do that here
    let detourResult = 0
    if (!checkSumStarted && currentChar === '?' && arr.sum(remainingCheckSums) < remainingGroups.map(g => g.join('')).join('').length) {
        logContinue('detour branch: we could just not do this, so lets go down that path')
        const newGroups = currentGroup.length === 1 ? remainingGroups.slice(1) : [currentGroup.slice(1), ...remainingGroups.slice(1)]
        detourResult = recursiveGroupCount(remainingCheckSums, newGroups)
    }

    // Special edge cases: if the currentCheckSum is one, we have some invalidating checks to do

    if (currentCheckSum === 1) {
        // Why 1 ? well, zero introduces some weird edge cases, basically, the current checksum should never be zero

        // if we make a recursive call, we will not be including the current checkSum (except in one edge case)
        const newRemainingCheckSums = remainingCheckSums.slice(1)

        if (currentGroup.length === 1) {
            //since we already went down the defer path, this is easy
            logContinue('Dropping current checksum and current group')
            return recursiveGroupCount(remainingCheckSums.slice(1), remainingGroups.slice(1)) + detourResult

            // const currentBranch = branchCount
            // branchCount++
            // const prefix = `[branch: ${currentBranch}] `
            // devLog(prefix, 'Split chance, splitting on broken path first.')
            // const brokenPath = recursiveGroupCount(newRemainingCheckSums, remainingGroups.slice(1))
            // devLog(prefix, 'Now for the non-broken path')
            // const nonBrokenPath = recursiveGroupCount(remainingCheckSums, remainingGroups.slice(1))
            // devLog(prefix, `Results, broken: ${brokenPath}, nonBroken: ${nonBrokenPath}`)
            // return  brokenPath + nonBrokenPath
        }
        const nextChar = currentGroup[1]
        if (nextChar === '#') {
            // it doesn't matter what the current character is, the rules state that we need at least 1 unbroken spring between broken ones,
            // so this is invalid
            logInvalidExit('Need to split group, but the character after this one is definitely a broken spring!')
            return 0 + detourResult
        }
        // okay, so, we know that we need to split the group and drop the current check sum.
        // but we must follow rule 2: no empty groups, so if there are two characters left in the group, we're just gonna drop
        // the whole thing since that's the only valid thing we can do
        if (currentGroup.length === 2) {
            logContinue('The only valid solution in this scenario is to drop the current group and continue')
            return recursiveGroupCount(remainingCheckSums.slice(1), remainingGroups.slice(1)) + detourResult
        }

        // so we have a group that can be split, and in fact, needs to be split, so let's do that
        const splitGroup = currentGroup.slice(2)

        logContinue('Splitting the group and continuing!')
        return recursiveGroupCount(newRemainingCheckSums, [splitGroup, ...remainingGroups.slice(1)]) + detourResult
    }

    // so, we've done the detour route, we know we don't have to start a new checksum, we know that we MUST be starting the checkSum!!!!
        // why ? because if we hadn't, it would be in the detour route, which we already took, so we just can assume at this point.
    // we can check if there's an early exit opportunity:
        // checksum is started and size of group is too small (because we do detour route, we are not going to consider what happens if )

    // if we have started the checkSum and the size of the group is too small, this is invalid
    if (currentCheckSum > currentGroup.length) {
        logInvalidExit('We are assuming that the checkSum has been started, so we know this is invalid route since the group is too small for the checksum')
        return 0 + detourResult
    }

    const newRemainingCheckSums = [currentCheckSum - 1, ...remainingCheckSums.slice(1)]
    const newRemainingGroups = [currentGroup.slice(1), ...remainingGroups.slice(1)]
    // logContinue('continuing with check-sum investigation')
    return recursiveGroupCount(newRemainingCheckSums, newRemainingGroups, true) + detourResult

}

const results = []

for (let i = 0; i < hotSpringLines.length; i++) {
    const hotSpringLine = hotSpringLines[i]
    // console.log(i + 1)
    const { groups, checkSums } = hotSpringLine
    results.push(recursiveGroupCount(checkSums, groups))
}

console.log(arr.sum(results))
