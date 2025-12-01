#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include "../util.h"

typedef struct {
    char direction;
    int32_t count;
} DialTurn;


int main() {
    int32_t dialPos = 50;
    // char inputPath[] = "./01/example.txt";
    char inputPath[] = "./01/input.txt";
    FILE *input = fopen(inputPath, "r");
    assert(input != NULL, "Could not open %s", inputPath);
    char * line = NULL;
    size_t length = 0;
    // printf("Got a line! Line: %s", line);
    size_t timesAt0 = 0;
    ssize_t readLen = 0;
    while ((readLen =  getline(&line, &length, input)) != -1) {
        DialTurn turn = {
            .direction = line[0],
            .count = atoi(line + 1),
        };
        if (turn.count / 100 > 0) {
            timesAt0 += turn.count / 100;
            turn.count = turn.count % 100;
            if (turn.count == 0) continue;
        }
        if (dialPos == 0 && turn.direction == 'L') timesAt0 -= 1;
        if (turn.direction == 'L') {
            dialPos = dialPos - turn.count;
        } else {
            dialPos = dialPos + turn.count;
        }
        if (dialPos <= 0 || dialPos >= 100) timesAt0 += 1;
        dialPos = (dialPos + 100) % 100;
        // line[readLen - 1] = '\0';
        // printf("Line: %s, dialPos: %d, timesAt0: %zu\n", (line), dialPos, timesAt0);
    }
    printf("%zu\n", timesAt0);
};