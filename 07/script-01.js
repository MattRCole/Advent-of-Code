const fs = require("node:fs")

const file = fs.readFileSync("./07/input.txt", { encoding: "utf-8" })

const cards = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
const rankOrder = ['fiveOfAKind', 'fourOfAKind', 'fullHouse', 'threeOfAKind', 'twoPair', 'onePair', 'highCard']
/** @type {{ [rank: string]: Hand[]}} */
const results = {
    fiveOfAKind: [],
    fourOfAKind: [],
    fullHouse: [],
    threeOfAKind: [],
    twoPair: [],
    onePair: [],
    highCard: [],
}

const lines = file.split('\n').filter(({ length }) => length)

/** @typedef {{ cards: string[], bid: number, meaningfulCards?: string[], originalOrder: string[] }} Hand */

/** @type {Hand[]} */
const hands = lines.map(l => {
    const [handStr, bidStr] = l.split(' ')
    return {
        cards: handStr.split('').sort((a, b) => cards.indexOf(a) - cards.indexOf(b)),
        bid: parseInt(bidStr),
        originalOrder: handStr.split(''),
    }
})

/** @type {(hand: Hand) => string[]} */
const getHandType = hand => {
    let run = 0
    let result = []
    let resultCards = []
    let lastCard = undefined
    for (const card of hand.cards) {
        if (lastCard === undefined) {
            lastCard = card
            run++
            continue
        }
        if (card === lastCard) {
            run++
            continue
        }
        resultCards.push(lastCard)
        lastCard = card
        result.push(run)
        run = 1
    }
    if (lastCard === hand.cards[hand.cards.length - 1]) {
        resultCards.push(lastCard)
        result.push(run)
    }

    if (result[0] === 5) return ['fiveOfAKind', resultCards[0]]

    if (result.includes(4)) return ['fourOfAKind', resultCards[result.indexOf(4)]]

    if (result.includes(3) && result.includes(2)) return ['fullHouse', resultCards[result.indexOf(3)], resultCards[result.indexOf(2)]]

    if (result.includes(3)) return ['threeOfAKind', resultCards[result.indexOf(3)]]

    if (result.includes(2) && result.slice(result.indexOf(2) + 1).includes(2)) {
        const pairCards = resultCards.filter((_, index) => result[index] === 2).sort((a, b) => cards.indexOf(a) - cards.indexOf(b))
        return ['twoPair', ...pairCards]
    }

    if (result.includes(2)) return ['onePair', resultCards[result.indexOf(2)]]

    return ['highCard', hand.cards[0]]
}

const sortHand = 

hands.forEach(hand => {
    const [type, ...meaningfulCards] = getHandType(hand)
    // console.log(type)
    results[type].push({ ...hand, meaningfulCards })
})
// console.log(hands.map(hand => ({ ...hand, type: getHandType(hand) })))
// console.log(results)

/** @type {(a: Hand, b: Hand) => number} */
const sortByHandInRank = (a, b) => {
    // for (let i = 0; i < a.meaningfulCards.length; i++) {
    //     const aIndex = cards.indexOf(a.meaningfulCards[i])
    //     const bIndex = cards.indexOf(b.meaningfulCards[i])
    //     if (aIndex - bIndex === 0) continue

    //     return aIndex - bIndex
    // }
    for (let i = 0; i < a.originalOrder.length; i++) {
        const aIndex = cards.indexOf(a.originalOrder[i])
        const bIndex = cards.indexOf(b.originalOrder[i])
        if (aIndex - bIndex === 0) continue

        return aIndex - bIndex
    }
    return 0
}

const finalOrder = rankOrder.map(rank => {
    if (rank === 'highCard') {
        console.log('')
    }
    const localResult = [...results[rank]].sort(sortByHandInRank)
    return localResult
}).reduce((acc, hands) => [...acc, ...hands], [])

fs.writeFileSync('./out.txt', JSON.stringify({ finalOrder, results }, null, 2))

console.log([...finalOrder].reverse().reduce((acc, hand, index) => acc + ((index + 1) * hand.bid), 0))


// answers
// 248445994
// 248414749
