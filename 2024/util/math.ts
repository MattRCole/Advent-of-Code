import { enumerate, lastIndex } from "./array.ts";
import { toNumericKeys } from "./object.ts";

const isPrime = (candidate: number, ...primes: number[]) => {
  for (const prime of primes) {
    if (candidate % prime === 0) return false;
  }
  return true;
};

const nextBiggestPrimeCached = (primes: number[]) => (index: number) => {
  if (index < primes.length) return primes[index];
  const findTheNextNPrimes = index - lastIndex(primes);

  for (let i = primes.length; i <= index; i++) {
    let next = primes[i - 1] + 1;
    while (!isPrime(next, ...primes)) next++;
    primes.push(next);
  }
  return primes[index];
};

export const getNthPrime = nextBiggestPrimeCached([2] as number[]);

export type FactorMap = { [prime: number]: number };

export const getFactors = (num: number): FactorMap => {
  if (Math.floor(num) !== num) {
    throw new Error("Cannot get factors of a floating-point number!");
  }
  if (num < 0) throw new Error("Cannot find factors of negative number");

  const factors: { [prime: number]: number } = {};
  let primeIndex = 0;

  while (num !== 1) {
    const prime = getNthPrime(primeIndex);
    if (num === 0) throw new Error("AAAAAAAAAa");
    if (num % prime === 0) {
      let primeCount = 0;
      while (num % prime === 0) {
        primeCount++;
        num = num / prime;
      }
      factors[prime] = primeCount;
    }
    primeIndex++;
  }
  return factors;
};

export const getCommonFactors = (...nums: number[]): number[] => {
  const dedupedNumbers = new Set(nums);
  let commonFactors = new Set<number>();

  for (const [idx, num] of enumerate([...dedupedNumbers.values()])) {
    if (idx === 0) {
      commonFactors = new Set(toNumericKeys(getFactors(num)));
    } else {
      commonFactors = commonFactors.intersection(
        new Set(toNumericKeys(getFactors(num))),
      );
      if (commonFactors.size === 0) return [];
    }
  }
  return [...commonFactors.values()];
};

export const getGreatestCommonDenominator = (...nums: number[]): number => {
  const factors = getCommonFactors(...nums).toSorted((a, b) => b - a);
  if (factors.length === 0) return -1;

  return factors[0];
};

// export const getFactorMapWithCachedPrimes = (
//   num: number,
//   primes: number[],
// ): { primes: number[]; factors: { [prime: number]: number } } => {
//   if (Math.floor(num) !== num) {
//     throw new Error("Cannot get factors of a floating-point number!");
//   }
//   const factors: { [prime: number]: number } = {};
//   if (num < 0) {
//     num = -num;
//     factors[-1] = 1;
//   }
//   if (num < 1) {
//     factors[num] = 1;
//     return { factors, primes };
//   }
//   let primeIndex = 0;

//   let count = 0;
//   while (num !== 1) {
//     count++;
//     const nextPrime = primeIndex >= primes.length
//       ? nextBiggestPrime(...primes)
//       : primes[primeIndex];
//     primes.length <= primeIndex && primes.push(nextPrime);
//     primeIndex++;
//     if (num === 0 || count > 10) throw new Error("AAAAAAAAAa");
//     if (num % nextPrime === 0) {
//       let primeCount = 0;
//       while (num % nextPrime === 0) {
//         primeCount++;
//         num = num / nextPrime;
//       }
//       factors[nextPrime] = primeCount;
//     }
//   }
//   return { factors, primes };
// };

// export const getFactors = (num: number): number[] => {
//   return getFactorsWithCachedPrimes(num, []).factors
// }

export const leastCommonMultiple = (...nums: number[]): number => {
  const greatestFactorsMap: { [prime: number]: number } = {};
  for (const num of nums) {
    const factors = getFactors(num);
    for (const prime of toNumericKeys(factors)) {
      greatestFactorsMap[prime] = Math.max(
        greatestFactorsMap[prime] || 0,
        factors[prime],
      );
    }
  }
  return toNumericKeys(greatestFactorsMap).reduce(
    (total, prime) => total * Math.pow(prime, greatestFactorsMap[prime]),
    1,
  );
};
