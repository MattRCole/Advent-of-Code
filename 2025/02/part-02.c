#include <string.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include "../util.h"

#define INPUT_PATH "./02/input.txt"
// #define INPUT_PATH "./02/example.txt"

#define BUFFER_SIZE 200

#define CANDIDATE_MAX 1000

size_t powLL(size_t base, size_t power) {
    size_t result = 1;
    for (size_t i = 0; i < power; i++) {
        result *= base;
    }
    return result;
}

size_t powTenLL(size_t power) {
    size_t result = 1;
    for (size_t i = 0; i < power; i++) {
        result *= 10;
    }
    return result;
}

size_t isolatePower(size_t powerOfTen, size_t number) {
    if (powerOfTen == 0) {
        return number % 10;
    }
    return (number % powTenLL(powerOfTen + 1)) / powTenLL(powerOfTen);
};
size_t isolatePowerRange(size_t maxPowerOfTen, size_t minPowerOfTen, size_t number) {
    assert(maxPowerOfTen >= minPowerOfTen, "Got max and min mixed up! Max: %zu, min: %zu\n", maxPowerOfTen, minPowerOfTen);

    // printf("Orig: %zu, Modulated: %zu, %zu/%zu=%zu\n", number, number % powTenLL(maxPowerOfTen + 1), number % powTenLL(maxPowerOfTen + 1), powTenLL(minPowerOfTen), (number % powTenLL(maxPowerOfTen + 1)) / powTenLL(minPowerOfTen));
    return (number % powTenLL(maxPowerOfTen + 1)) / powTenLL(minPowerOfTen);
}


int main() {
    FILE *input = fopen(INPUT_PATH, "r");
    int64_t invalidIds[BUFFER_SIZE * 10] = {0};
    assert(input != NULL, "Could not open %s\n", INPUT_PATH);
    size_t startI = 0;
    size_t endI = 0;
    int nextChar = '\0';
    size_t total;
    size_t count = 0;

    do {
        bool useEnd = false;
        size_t offset = 0;
        char start[BUFFER_SIZE] = {0};
        char end[BUFFER_SIZE] = {0};
        while ((nextChar = getc(input)) != EOF && nextChar != ',') {
            // Null terminate the string, swap to other buffer
            if (nextChar == '-') {
                useEnd = true;
                start[offset] = '\0';
                offset = 0;
                continue;
            }
            (useEnd ? end : start)[offset] = (char)nextChar;
            offset++;
        }
        end[offset] = '\0';
        startI = atol(start);
        endI = atol(end);

        // if (startI != 5426 || endI != 11501) continue; // skip to trouble number

        size_t startLen = strnlen(start, BUFFER_SIZE);
        size_t endLen = strnlen(end, BUFFER_SIZE);
        
        size_t currLen = startLen;
        size_t factorsBuffer[20] = {0};
        size_t factorCountsBuffer[20] = {0};
        size_t candidateBuffer[CANDIDATE_MAX] = {0};
        size_t candidateCount = 0;
        while (currLen <= endLen) {
            if (currLen == 1) {
                currLen++;
                continue;
            }
            size_t groupSizesBuffer[40] = {0};
            groupSizesBuffer[0] = 1;
            size_t groupSizesCount = 1;
            int64_t factorCount = getPrimeFactors(currLen, factorsBuffer, factorCountsBuffer, 20);
            assert(factorCount >= 0, "Couldn't factorize the length: %zu\n, err; %lld", currLen, factorCount);

            for(size_t i = 0; i < factorCount; i++) {
                size_t factor = factorsBuffer[i];
                // printf("(current length: %zu) Adding groups for factor: %zu: ", currLen, factor);
                for(size_t j = 1; j <= factorCountsBuffer[i]; j++) {
                    assert(groupSizesCount < 40, "Ran out of groups while computing %lld factors of %zu", factorCount, currLen);
                    if (powLL(factor, j) != currLen) {
                        // printf(" '%zu'", powLL(factor, j));
                        groupSizesBuffer[groupSizesCount] = powLL(factor, j);
                        groupSizesCount++;
                    }
                }
                // printf("\n");
            }
            size_t terminalNum = 0;
            if (currLen == endLen) {
                terminalNum = endI;
            } else {
                terminalNum = powTenLL(currLen) - 1;
            }
            for(size_t i = 0; i < groupSizesCount; i++) {
                size_t groupSize = groupSizesBuffer[i];
                size_t groupCount = currLen / groupSize;

                size_t workingNumber = 0;
                if (currLen == startLen) {
                    workingNumber = startI;
                } else {
                    for(size_t j = 1; j <= groupCount; j++) { workingNumber += powTenLL((j * groupSize) - 1); }
                    // printf("Since currLen %zu != startLen %zu, made a new working number (group size is: %zu): %zu\n", currLen, startLen, groupSize, workingNumber);
                }
                assert(workingNumber > 0, "Tried to make a working number but couldn't! groupSize=%zu, groupCount=%zu, startI=%zu, endI=%zu\n", groupSize, groupCount, startI, endI);
                while (workingNumber <= terminalNum) {
                    size_t groupsAllMatch = true;
                    size_t moreSignificantIsolated = 0;
                    for (size_t j = groupCount; j > 0; j--) {
                        size_t minPow = ((j - 1) * groupSize);
                        size_t maxPow = (j * groupSize) - 1;
                        size_t workingIsolated = isolatePowerRange(maxPow, minPow, workingNumber);
                        size_t oldWorkingNumber = workingNumber;
                        // printf("(group size: %zu, group number: %zu out of %zu, workingNumber: %zu, terminalNum: %zu) ", groupSize, j, groupCount, workingNumber, terminalNum);
                        if (moreSignificantIsolated == 0) {
                            // the first group.
                            moreSignificantIsolated = workingIsolated;
                            // printf("Setting more significant isolated to %zu\n", moreSignificantIsolated);
                            continue;
                        }
                        if (moreSignificantIsolated == workingIsolated) {
                            // This is the first group, so we'll skip to next isolated group
                            // printf("Isolated %zu matches more significant isolated %zu\n", workingIsolated, moreSignificantIsolated);
                            continue;
                        } else if (moreSignificantIsolated > workingIsolated) {
                            /*
                               Basically remove the current isolated numbers from the working number, then add the more significant isolated number back in
                               Example, say we're working on a 6 digit number 654321, we're working on the 43 group, moreSignificantIsolated would be 65
                               First we want to minus 4321 from the number to "reset" less significant digits in the number
                            */
                            // printf("Current isolated %zu is smaller than prev isolate: %zu. ", workingIsolated, moreSignificantIsolated);
                            workingNumber -= isolatePowerRange(maxPow, 0, workingNumber);
                            // Now we'll add the moreSignificantIsolated to the working number (add 6500), our number is now 656500
                            workingNumber += moreSignificantIsolated * powTenLL(minPow);

                            // If our working number is too big now... (say terminalNum is like.... 656400)
                            if (workingNumber > terminalNum) {
                                // printf("Tried to increment from %zu -> %zu, but it's larger than %zu\n", oldWorkingNumber, workingNumber, terminalNum);
                                // mark the current number as not a grouping of repeating numbers and break
                                groupsAllMatch = false;
                                break;
                            }
                            // printf("Incremented from %zu -> %zu. Continuing\n", oldWorkingNumber, workingNumber);

                            // otherwise, we're good to continue.
                        } else {
                            /*
                               So this set is currently bigger than the previous one.... we will need to add 1 somewhere
                               Example: 656566 with group size of 2 we could add 100 and continue, but it's better just add
                                        one to the current most significant isolated group (65 -> 66), and reset the number.
                                        to skip from 656566 to 660000
                            */
                            workingNumber = (moreSignificantIsolated + 1) * powTenLL((groupCount - 1) * groupSize);
                            groupsAllMatch = false;
                            // printf("More significant isolated %zu is smaller than current: %zu, Updating number from %zu -> %zu and restarting loop\n", moreSignificantIsolated, workingIsolated, oldWorkingNumber, workingNumber);
                            break;
                        }

                    }
                    // At this point, we've ran through the groups adjusting them as needed. We very well might have a match!
                    if (groupsAllMatch == true) {
                        // First, there's a good chance that this invalid ID has already been found.
                        bool shouldAddAsInvalidId = true;
                        for(size_t i = 0; i < candidateCount; i++) {
                            if (candidateBuffer[i] == workingNumber) {
                                shouldAddAsInvalidId = false;
                                break;
                            }
                        }
                        if (shouldAddAsInvalidId) {
                            for(size_t i = 0; i < count; i++) {
                                if (invalidIds[i] == workingNumber) {
                                    printf("Dupes do exist! Found %zu already in invalidIds\n", workingNumber);
                                    shouldAddAsInvalidId = false;
                                    break;
                                }
                            }
                        }

                        if (shouldAddAsInvalidId) {
                            candidateBuffer[candidateCount] = workingNumber;
                            invalidIds[count] = workingNumber;
                            candidateCount++;
                            count++;
                            assert(count < BUFFER_SIZE * 10, "Ran out of invalid IDs!");
                            assert(candidateCount <= CANDIDATE_MAX, "Ran out of candidate space!");
                            printf("Added %zu to results (range is %zu to %zu, groupSize: %zu)\n", workingNumber, startI, endI, groupSize);
                        } /*else {
                            printf("%zu was already added, skipping.\n", workingNumber);
                        }*/
                        /*
                           we'll add one to the most significant group and continue.
                           Following our example of 654321, let's pretend 656565 was < terminalNum.
                           We aren't sure if we're done looking for matches yet,
                           so let's just increment the most significant group and continue the while loop.

                           groupCount is 3, groupSize is 2 so 10^((3 - 1) * 2) = 10000 giving us 666565
                           (note, we don't have to worry about the two groups of 666 because that will be handled separately.)
                        */
                        workingNumber += powTenLL((groupCount - 1) * groupSize);
                    }
                }
                // printf("Done with group sizes of %zu.", groupSizesBuffer[i]);
                // if ((i + 1) < groupSizesCount) {
                //     printf(" Moving on to sizes of %zu.\n", groupSizesBuffer[i + 1]);
                // } else {
                //     printf("\n");
                // }
            }
            currLen++;
        }
    } while (nextChar != EOF);
    size_t sum = 0;
    for (size_t i = 0; i < count; i++) { sum += invalidIds[i];  }
    printf("count: %zu, sum: %zu\n", count, sum);
    return 0;
}
