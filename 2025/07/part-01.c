#include <string.h>
#include <stdio.h>
#include "../util.h"

// #define INPUT_PATH "./07/input.txt"
#define INPUT_PATH "./07/example.txt"

dynamic_array(FileLines, char *);

int main() {
    FileLines lines = new_dynamic_arr(0, 0, char *, NULL);
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t lineLen;
    
    while((lineLen = getline(&line, &lineCapp, input)) > 0) {
        add_dynamic_item(lines, calloc(lineLen + 1, sizeof(char)));
        strncpy(dynamic_last(lines), line, line[lineLen - 1] == '\n' ? lineLen - 1 : lineLen);
        // printf("%03zu (count: %014zd): %s", lines.length, lineLen, line);
        // if (line[lineLen - 1] != '\n') printf("\n");
        // printf("Copied line (count: %05zd): '%s'\n", strlen(dynamic_last(lines)), dynamic_last(lines));
    }

    size_t splitTotal = 0;

    for(size_t lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        if (lineIdx == 0) {
            for(size_t i = 0; i < strlen(lines.data[lineIdx]); i++) {
                if (lines.data[lineIdx][i] == 'S') {
                    lines.data[lineIdx][i] = '|';
                    break;
                }
            }
        }
        // skip last line
        if (lineIdx + 1 == lines.length) continue;
        char *currLine = lines.data[lineIdx];
        char *nextLine = lines.data[lineIdx + 1];
        for(ssize_t i = 0; i < strlen(currLine); i++) {
            if (currLine[i] != '|') continue;

            if (nextLine[i] != '^') {
                nextLine[i] = '|';
                continue;
            }
            splitTotal += 1;
            if (i - 1 >= 0) nextLine[i - 1] = '|';
            if (i + 1 < strlen(nextLine)) nextLine[i + 1] = '|';
        }
    }
    // for(size_t i = 0; i < lines.length; i++) printf("%s\n", lines.data[i]);

    printf("Split total: %zu\n", splitTotal);

    return 0;
}
