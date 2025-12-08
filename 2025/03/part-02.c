#include <string.h>
#include <stdio.h>
#include "../util.h"

#define INPUT_PATH "./03/input.txt"
// #define INPUT_PATH "./03/example.txt"

#define BUFFER_SIZE 500
#define CELL_COUNT 12

int main() {
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t lineLen;
    size_t lineNo = 0;
    size_t resultsBuffer[BUFFER_SIZE] = {0};
    while((lineLen = getline(&line, &lineCapp, input)) > 0) {
        lineNo++;
        assert(lineNo <= BUFFER_SIZE, "Ran out of buffer space!\n");

        uint8_t *lineNums = malloc(sizeof(uint8_t) * lineLen);
        size_t numberCount = 0;

        for(size_t i = 0; i < lineLen; i++) {
            if (!isNumeric(line[i])) {
                assert(i + 1 == lineLen, "Found a non-numeric that isn't at the end of the line! position: %zu, Line: %s\n", i, line);
                continue;
            }

            lineNums[i] = getNumericFromAscii(line[i]);
            numberCount++;
        }
        size_t lineResult = 0;
        ssize_t offsetIdx = -1;

        for(size_t i = CELL_COUNT; i > 0; i--) {
            size_t currResult = 0;
            for(size_t j = offsetIdx + 1; j < numberCount - i + 1; j++) {
                if (lineNums[j] <= currResult) continue;
                offsetIdx = j;
                currResult = lineNums[j];
                if (currResult == 9) break;
            }
            lineResult += powTenLL(i - 1) * currResult;
        }

        // We're only going to go to the second to last number. Because 10 is > 9
        // for(size_t i = 0; i < numberCount - 1; i++) {
        //     if (lineNums[i] <= biggest) continue;
        //     if (lineNums[i] == 9) {
        //         // early exit: we ain't gettin' bigger than 9
        //         biggest = 9;
        //         biggestIdx = i;
        //         break;
        //     }
        //     biggest = lineNums[i];
        //     biggestIdx = i;
        // }

        // for(size_t i = biggestIdx + 1; i < numberCount; i++) {
        //     secondNum = max(secondNum, lineNums[i]);
        // }

        resultsBuffer[lineNo - 1] = lineResult;
        // printf("%s", line);
        // if (line[lineLen - 1] != '\n') printf("\n");
        // printf("Biggest combo is: %zu\n", resultsBuffer[lineNo - 1]);
    }

    size_t result = 0;

    for(size_t i = 0; i < lineNo; i++) result += resultsBuffer[i];

    printf("result: %zu\n", result);

    return 0;
}
