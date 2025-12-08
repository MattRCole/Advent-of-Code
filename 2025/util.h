#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#define fail(...) do { printf(__VA_ARGS__); exit(1); } while (0)
#define assert(condition, ...) do { if (!(condition)) fail(__VA_ARGS__); } while (0)
#define max(a, b) (a) > (b) ? (a) : (b)
#define min(a, b) (a) > (b) ? (b) : (a)
#define two_d_index(col_len, x, y) (((y) * (col_len)) + (x))
#define clamp(minimum, target, maximum) max((minimum), min((target), (maximum)))

int64_t getPrimeFactors(size_t number, size_t *resultsOut, size_t *resultCountsOut, size_t maxResults);
size_t powLL(size_t base, size_t power);
size_t powTenLL(size_t power);
size_t isolatePowerRange10(size_t maxPowerOfTen, size_t minPowerOfTen, size_t number);
size_t isolatePowerRange(size_t base, size_t maxBasePower, size_t minBasePower, size_t number);
uint8_t getNumericFromAscii(char character);
bool isNumeric(char character);

extern size_t *primes;
extern size_t primeCount;