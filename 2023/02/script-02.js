const fs = require('fs')

const file = fs.readFileSync('./02/input.txt', { encoding: 'utf-8'})

const regex = /((?<red>\d+)\sred|(?<green>\d+)\sgreen|(?<blue>\d+)\sblue)/g

/** @typedef {{ red: number, green: number, blue: number }} Pull */

/** @type {(pullStr: string) => Pull} */
const getPullInfo = pullStr => {
    return [...pullStr.matchAll(regex)].map(i => i.groups).reduce((acc, item) => {
        const keys = ['red', 'blue', 'green']
        return keys.reduce((acc2, k) => ({ ...acc2, [k]: parseInt(acc[k] || item[k] || "0")}), {})
    }, {})
}

const info = file.split('\n').map((l, index) => {
    const [idStr, gamesStr] = l.split(':')
    const id = parseInt(idStr.slice('Game '.length))

    if (Number.isNaN(id)) throw new Error(`Could not parse id for line: "${l}", index: ${index}`)

    const pulls = gamesStr.split(';').map(getPullInfo)
    
    const result = {
        id,
        pulls
        // (games[0].match(/(?<red>\d+)\sred/) || { groups: {} }).groups
    }
    return result
})


/** @type {(pulls: Pull[]) => Pull} */
const getMinimumsForGame = pulls => pulls.reduce((acc, pull) => {
    return {
        red: Math.max(acc.red, pull.red),
        green: Math.max(acc.green, pull.green),
        blue: Math.max(acc.blue, pull.blue)
    }
}, { red: 0, green: 0, blue: 0 })

const getPower = pull => Object.keys(pull).reduce((acc, k) => acc * pull[k], 1)

// for (let game of info) {
//     console.log(JSON.stringify({ id: game.id, minimum: getMinimumsForGame(game.pulls), pulls: game.pulls }))
// }

console.log(info.map(({ pulls }) => getMinimumsForGame(pulls)).map(getPower).reduce((acc, power) => acc + power, 0))
