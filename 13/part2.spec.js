const {
  getPerturbedTestIndexes
} = require('./script-02')

describe('#getPerturbedTestIndexes', () => {
  it('can correctly perturb the rocks', () => {
    const checkSums = [1,2,6,8,1]
    const { addRock } = getPerturbedTestIndexes(checkSums)

    expect(addRock).toEqual([{ atIndex: 0, preliminaries: [1] }])
  })
  it('can correctly perturb the ashes', () => {
    const checkSums = [1,2,6,8,1]
    const { addAsh } = getPerturbedTestIndexes(checkSums)

    expect(addAsh).toEqual([{ atIndex: 1, preliminaries: [1] }])
  })
})