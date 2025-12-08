#include <string.h>
#include <stdio.h>
#include "../util.h"

#define INPUT_PATH "./04/input.txt"
// #define INPUT_PATH "./04/example.txt"

int main() {
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t lineLen;
    size_t lineNo = 0;
    size_t colCount = 0;
    
    while((lineLen = getline(&line, &lineCapp, input)) > 0) {
        if (colCount == 0) {
            colCount = line[lineLen - 1] == '\n' ? lineLen - 1 : lineLen;
        }
        lineNo++;
        // printf("%03zu (count: %05zd): %s", lineNo, lineLen, line);
    }
    size_t cellCount = colCount * lineNo;
    bool *grid = malloc(sizeof(bool) * cellCount);

    bool *accessibleGrid = malloc(sizeof(bool) * cellCount);
    size_t accessibleRoles = 0;
    size_t lastAccessibleRoles = 0;
    // bool *counts = malloc(sizeof(size_t) * cellCount);

    fseek(input, 0L, SEEK_SET);
    size_t y = 0;
    while((lineLen = getline(&line, &lineCapp, input)) > 0) {
        for(size_t x = 0; x < colCount; x++) {
            if (line[x] == '@') {
                grid[two_d_index(colCount, x, y)] = true;
                accessibleGrid[two_d_index(colCount, x, y)] = false;
            } else {
                grid[two_d_index(colCount, x, y)] = false;
            }
        }
        y++;
    }

    do {
        lastAccessibleRoles = accessibleRoles;
        for(size_t y = 0; y < lineNo; y++) {
            for(size_t x = 0; x < colCount; x++) {
                if (!grid[two_d_index(colCount, x, y)]) continue;
                size_t localCount = 0;
                for(ssize_t i = -1; i <= 1; i++) {
                    for(ssize_t j = -1; j <= 1; j++) {
                        if (i == 0 && j == 0) continue;
                        if ((ssize_t)(x) + i < 0 || x + i >= colCount || (ssize_t)y + j < 0 || y + j >= lineNo) continue;

                        if (grid[two_d_index(colCount, x + i, y + j)]) {
                            localCount++;
                            if (localCount >= 4) break;
                        }
                    }
                }

                if (localCount < 4 && accessibleGrid[two_d_index(colCount, x, y)] != true) {
                    accessibleGrid[two_d_index(colCount, x, y)] = true;
                    accessibleRoles += 1;
                }
            }
        }

        if (lastAccessibleRoles != accessibleRoles) {
            for(size_t y = 0; y < lineNo; y++) {
                for(size_t x = 0; x < colCount; x++) {
                    if (grid[two_d_index(colCount, x, y)]) {
                        if (accessibleGrid[two_d_index(colCount, x, y)]) {
                            printf("x");
                            grid[two_d_index(colCount, x, y)] = false;
                        }
                        else {
                            printf("@");
                        }
                    } else {
                        printf(".");
                    }
                }
                printf("\n");
            }
        }

    } while(lastAccessibleRoles != accessibleRoles);

    printf("Accessible count: %zu\n", accessibleRoles);

    return 0;
}
