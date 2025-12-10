#include <string.h>
#include <stdio.h>
#include "../util.h"

#define INPUT_PATH "./07/input.txt"
// #define INPUT_PATH "./07/example.txt"

dynamic_array(FileLines, char *);

typedef struct {
    size_t lineIdx;
    size_t colIdx;
} StackFrame;

dynamic_array(NumberLines, size_t *);


int main() {
    FileLines lines = new_dynamic_arr(0, 0, char *, NULL);
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t rawLineLen;

    while((rawLineLen = getline(&line, &lineCapp, input)) > 0) {
        add_dynamic_item(lines, calloc(rawLineLen + 1, sizeof(char)));
        strncpy(dynamic_last(lines), line, line[rawLineLen - 1] == '\n' ? rawLineLen - 1 : rawLineLen);
        // printf("%03zu (count: %014zd): %s", lines.length, rawLineLen, line);
        // if (line[rawLineLen - 1] != '\n') printf("\n");
        // printf("Copied line (count: %05zd): '%s'\n", strlen(dynamic_last(lines)), dynamic_last(lines));
    }
    assert(lines.length > 0, "Somehow didn't read lines...");
    size_t lineLen = strlen(dynamic_first(lines));
    NumberLines numberLines = new_dynamic_arr(lines.length, 0, size_t *, NULL);
    FileLines ogLines = new_dynamic_arr(lines.length, 0, char *, NULL);
    for(size_t i = 0; i < lines.length; i++) {
        add_dynamic_item(ogLines, calloc(lineLen + 1, sizeof(char)));
        strcpy(dynamic_last(ogLines), lines.data[i]);
    }

    size_t timelineTotal = 0;

    for(size_t lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        if (lineIdx == 0) {
            add_dynamic_item(numberLines, calloc(lineLen, sizeof(size_t)));
            for(size_t i = 0; i < strlen(lines.data[lineIdx]); i++) {
                if (lines.data[lineIdx][i] == 'S') {
                    numberLines.data[lineIdx][i] = 1;
                    lines.data[lineIdx][i] = '|';
                    break;
                }
            }
        }
        if (lineIdx + 1 == lines.length) {
            // add up totals...
            size_t *currNumberLine = dynamic_last(numberLines);
            for(size_t i = 0; i < lineLen; i++) {
                timelineTotal += currNumberLine[i];
            }
            // fail("TODO: Add up totals\n");
            continue;
        }
        // add the next line since this isn't the last line.

        char *currLine = lines.data[lineIdx];
        char *nextLine = lines.data[lineIdx + 1];
        size_t *currNumberLine = dynamic_last(numberLines);
        add_dynamic_item(numberLines, calloc(lineLen, sizeof(size_t)));
        size_t *nextNumberLine = dynamic_last(numberLines);

        for(ssize_t i = 0; i < strlen(currLine); i++) {
            if (currLine[i] != '|') continue;

            if (nextLine[i] != '^') {
                nextLine[i] = '|';
                // propagate number...
                nextNumberLine[i] += currNumberLine[i];
                continue;
            }
            // splitTotal += 1;
            if (i - 1 >= 0) {
                nextLine[i - 1] = '|';
                // if (nextNumberLine[i - 1] <= 1) nextNumberLine[i - 1] += currNumberLine[i];
                // else nextNumberLine[i - 1] *= currNumberLine[i];
                nextNumberLine[i - 1] += currNumberLine[i];
            } else {
                // Left OOB
                printf("LEFT OOB line: %zu\n", lineIdx);
                timelineTotal += currNumberLine[i];
            }

            if (i + 1 < lineLen) {
                nextLine[i + 1] = '|';
                // if (nextNumberLine[i + 1] <= 1) nextNumberLine[i + 1] += currNumberLine[i];
                // else nextNumberLine[i + 1] *= currNumberLine[i];
                nextNumberLine[i + 1] += currNumberLine[i];
            } else {
                printf("RIGHT OOB line: %zu\n", lineIdx);
                timelineTotal += currNumberLine[i];
            }
        }
    }
    for(size_t i = 0; i < lines.length; i++) {
        printf("%s\n", lines.data[i]);
    }
    printf("\n");

    // for(size_t i = 0; i < numberLines.length; i++) {
    //     for(size_t j = 0; j < lineLen; j++) {
    //         printf("%c  ", ogLines.data[i][j]);
    //     }
    //     printf("\n");

    //     for(size_t j = 0; j < lineLen; j++) {
    //         if (numberLines.data[i][j]) printf("%02zu ", numberLines.data[i][j]);
    //         else printf("   ");
    //     }
    //     printf("\n");
    // }

    printf("timeline total: %zu\n", timelineTotal);

    return 0;
}