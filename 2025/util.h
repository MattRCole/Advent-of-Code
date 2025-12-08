#pragma once
#include <stddef.h>
#include <stdint.h>

#define fail(...) do { printf(__VA_ARGS__); exit(1); } while (0)
#define assert(condition, ...) do { if (!(condition)) fail(__VA_ARGS__); } while (0)

int64_t getPrimeFactors(size_t number, size_t *resultsOut, size_t *resultCountsOut, size_t maxResults);

extern size_t *primes;
extern size_t primeCount;