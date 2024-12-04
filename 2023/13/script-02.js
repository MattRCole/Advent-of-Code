const fs = require('node:fs')

const {
  solveTerrainMapWithInfo,
  getCheckSums,
  parseFile,
  getPreliminaryTestIndexes,
} = require('./script-01')

const ASH = '.'
const ROCK = '#'
const NOT_ASH = ROCK
const NOT_ROCK = ASH

/** @typedef {{ atIndex: number, preliminaries: number[] }} Perturbation */
/** @type {(checkSums: number[]) => { addAsh: Perturbation[], addRock: Perturbation[] }} */
const getPerturbedTestIndexes = checkSums => {
  const addAsh = []
  const addRock = []
  for (let i = 0; i < checkSums.length; i++) {
    const ashArr = [...checkSums]
    const rockArr = [...checkSums]
    ashArr[i]--
    rockArr[i]++
    console.log({ ashArr, rockArr })
    const ashPrelims = getPreliminaryTestIndexes(ashArr)
    const rockPrelims = getPreliminaryTestIndexes(rockArr)
    if (ashPrelims.length > 0) addAsh.push({ atIndex: i, preliminaries: ashPrelims })
    if (rockPrelims.length > 0) addRock.push({ atIndex: i, preliminaries: rockPrelims })
  }
  console.log('addAsh\n', addAsh, '\naddRock\n', addRock)
  return { addAsh, addRock }
}

// /** @type {(terrainMap: string[]) => } */
// const solveTerrainMapWithPerturbations = terrainMap => {

// }

const main = () => {
  const terrainMaps = parseFile(fs.readFileSync('./13/input.txt', { encoding: 'utf-8' }))
  const terrainMapResults = terrainMaps.map(tm => solveTerrainMapWithInfo(tm))
  fs.writeFileSync('./13/results.json', JSON.stringify(terrainMapResults, null, 2))
}

if (require.main === module) {
  main()
}

module.exports = {
  getPerturbedTestIndexes
}
