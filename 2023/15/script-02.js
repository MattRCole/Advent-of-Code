const fs = require("node:fs")
const { doHASH } = require("./script-01")
const arr = require("../util/array")

/** @typedef {{ label: string, box: number, instruction: '=' | '-', focalLength?: number }} Instruction */
/** @typedef {{ [boxNo: number]: string[] }} HashMap */

/** @type {(file: string) => Instruction[]} */
const parseInput = file => {
  return file.split(',').map(l => {
    if (l.includes('-')) {
      const label = l.slice(0, -1)
      return {
        label,
        box: doHASH(label),
        instruction: '-'
      }
    }
    const [label, focalLengthStr] = l.split('=')

    return {
      label,
      box: doHASH(label),
      instruction: '=',
      focalLength: parseInt(focalLengthStr),
    }
  })
}

/** @type {(instruction: Instruction, hashMap: HashMap) => HashMap} */
const executeInstruction = (instruction, hashMap) => {
  const toKey = inst => `${inst.label}:${inst.focalLength}`

  const getLenseIndex = box => {
    if (box === undefined) return -1
    for(let i = 0; i < box.length; i++) {
      if (box[i].startsWith(instruction.label + ':')) return i
    }
    return -1
  }
  if (instruction.instruction === '-') {
    if (hashMap[instruction.box] === undefined || !hashMap[instruction.box].length) return hashMap
    const indexToRemove = getLenseIndex(hashMap[instruction.box])
    if (indexToRemove === -1) return hashMap
    hashMap[instruction.box] = arr.splice(hashMap[instruction.box], indexToRemove, 1)
    return hashMap
  }
  const indexToReplace = getLenseIndex(hashMap[instruction.box])
  if (indexToReplace === -1) {
    hashMap[instruction.box] = [...(hashMap[instruction.box] || []), toKey(instruction)]
    return hashMap
  }

  hashMap[instruction.box] = arr.splice(hashMap[instruction.box], indexToReplace, 1, toKey(instruction))
  return hashMap
}

/** @type {(box: string[]) => number[]} */
const computeBoxPower = box => {
  return box.map((key, i) => {
    const [_, focalLengthStr] = key.split(':')
    const focalLength = parseInt(focalLengthStr)
    return (i + 1) * focalLength
  })

}

const main = () => {
  const file = fs.readFileSync("./15/input.txt", { encoding: "utf-8" })
  let hashMap = {}
  const instructions = parseInput(file)

  for (const instruction of instructions) {
    hashMap = executeInstruction(instruction, hashMap)
    // console.log({ hashMap, instruction})
  }

  // console.log(hashMap)
  console.log({ 
    result: arr.sum(Object.keys(hashMap).map(boxNoStr => {
      const boxNumber = parseInt(boxNoStr)
      const boxPower = computeBoxPower(hashMap[boxNumber])
      return arr.sum(boxPower.map(power => power * (1 + boxNumber)))
    }))
  })

}

if (require.main === module) {
  main()
}
