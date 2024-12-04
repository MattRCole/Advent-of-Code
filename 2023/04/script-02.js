const fs = require('fs')

const file = fs.readFileSync('./04/input.txt', { encoding: 'utf-8'})


/** @typedef {{ cardNumber: number, winningNumbers: number[], numbers: number[] }} Card */

const parseNumbers = numString => numString.split(' ').filter(c => c.length).map(n => parseInt(n))

/** @type {Card[]} */
const cards = file
    .split('\n')
    .map(l => {
        const [cardStr, numbersStr] = l.split(':')
        const [winningNumsStr, numsString] = numbersStr.split('|')


        return {
            cardNumber: parseInt(cardStr.slice('Card '.length)),
            winningNumbers: parseNumbers(winningNumsStr),
            numbers: parseNumbers(numsString),
        }
    })


const queue = [...cards]

/** @type {(card: Card) => void} */
const processCard = card => {
    const totalWins = card.numbers.filter(n => card.winningNumbers.includes(n)).length
    if (totalWins === 0) return

    for (let i = 0; i < totalWins; i++) {
        queue.push(cards[card.cardNumber + i])
    }
}

for (let index = 0; index < queue.length; index++) {
    processCard(queue[index])
}

console.log(queue.length)
