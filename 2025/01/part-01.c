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
        if (turn.direction == 'L') {
            dialPos = (dialPos - turn.count) % 100;
        } else {
            dialPos = (dialPos + turn.count) % 100;
        }
        if (dialPos == 0) timesAt0 += 1;
    }
    printf("%zu\n", timesAt0);
};