const fs = require('fs')

const file = fs.readFileSync('./02/input.txt', { encoding: 'utf-8'})

const regex = /((?<red>\d+)\sred|(?<green>\d+)\sgreen|(?<blue>\d+)\sblue)/g

/** @type {(gameStr: string) => { red: number, blue: number, green: number }} */
const getGameInfo = gameStr => {
    return [...gameStr.matchAll(regex)].map(i => i.groups).reduce((acc, item) => {
        const keys = ['red', 'blue', 'green']
        return keys.reduce((acc2, k) => ({ ...acc2, [k]: parseInt(acc[k] || item[k] || "0")}), {})
    }, {})
}

const info = file.split('\n').map((l, index) => {
    const [idStr, gamesStr] = l.split(':')
    const id = parseInt(idStr.slice('Game '.length))

    if (Number.isNaN(id)) throw new Error(`Could not parse id for line: "${l}", index: ${index}`)

    const games = gamesStr.split(';')
    
    const result = {
        id,
        pulls: games.map(getGameInfo)
        // (games[0].match(/(?<red>\d+)\sred/) || { groups: {} }).groups
    }
    return result
})

const currentMaximums = {
    red: 12,
    green: 13,
    blue: 14,
}

const isValidGame = (pulls, maximums) => {
    for (let pull of pulls) {
        for (let color of Object.keys(maximums)) {
            if (pull[color] > maximums[color]) return false
        }
    }
    return true
}

console.log(info.filter(game => isValidGame(game.pulls, currentMaximums)).reduce((acc, { id }) => acc + id, 0))
