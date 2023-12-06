const fs = require('fs')

const file = fs.readFileSync('./06/input.txt', { encoding: 'utf-8'})

const [timeStr, distanceStr] = file.split('\n')

const times = [parseInt(timeStr.slice('Time: '.length).split(' ').filter(({ length }) => length).join(''))]
const distances = [parseInt(distanceStr.slice('Distance: '.length).split(' ').filter(({ length }) => length).join(''))]


const timesAndDistances = times.reduce((acc, time, i) => ([...acc, { time, distance: distances[i] }]), [])


const getTotalDistanceBreakdown = ({ time, distance }) => {
    const winningDistances = []
    for (i = 1; i < time - 1; i++) {
        const remainingTime = time - i
        const totalDistance = i * remainingTime
        if (totalDistance > distance) winningDistances.push(totalDistance)
    }

    return winningDistances
}
console.log(timesAndDistances.map(td => getTotalDistanceBreakdown(td)).reduce((acc, { length }) => acc * length, 1))


