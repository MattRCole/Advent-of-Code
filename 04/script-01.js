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

console.log(cards.map(({ winningNumbers, numbers }) => numbers.filter(n => winningNumbers.includes(n)).length).filter(n => n).reduce((acc, n) => acc + Math.pow(2, n - 1), 0))


