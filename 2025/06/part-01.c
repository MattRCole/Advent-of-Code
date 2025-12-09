#include <string.h>
#include <stdio.h>
#include "../util.h"

#define INPUT_PATH "./06/input.txt"
// #define INPUT_PATH "./06/example.txt"

#define BUFFER_SIZE 30

dynamic_array(MathLines, size_t *);

int main() {
    MathLines lines = new_dynamic_arr(3, 0, size_t *, NULL);
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t lineLen;
    size_t lineNo = 0;
    size_t colLen = 0;

    while((lineLen = getline(&line, &lineCapp, input)) > 0) {
        lineNo++;
        if (lineNo == 1) { for(size_t i = 0; i < lineLen; i++) if (i == 0 || (line[i - 1] == ' ' && isNumeric(line[i]))) colLen++; }
        add_dynamic_item(lines, calloc(colLen, sizeof(size_t)));

        char numberBuffer[BUFFER_SIZE] = {0};
        size_t offset = 0;
        size_t colIndex = 0;
        
        for(size_t i = 0; i < lineLen; i++) {
            if (line[i] == '+') {
                lines.data[lines.length - 1][colIndex] = 0;
                colIndex++;
                continue;
            }
            if (line[i] == '*') {
                lines.data[lines.length - 1][colIndex] = 1;
                colIndex++;
                continue;
            }
            if (!isNumeric(line[i])) continue;
            offset = i;
            while(isNumeric(line[i])) i++;

            assert(i - offset < BUFFER_SIZE, "RAN OUT OF BUFFER SPACE!!!\n");
            strncpy(numberBuffer, line + offset, i - offset);
            numberBuffer[i - offset] = '\0';
            lines.data[lines.length - 1][colIndex] = atoll(numberBuffer);
            colIndex++;
            assert(colIndex <= colLen, "TOO MANY NUMBERS!!! colIndex: %zu, colLen: %zu\n", colIndex, colLen);
        }

        // printf("%03zu (count: %05zd): %s", lineNo, lineLen, line);
        // if (line[lineLen - 1] != '\n') printf("\n");

        // printf("Computed numbers: ");
        // for (size_t i = 0; i < colLen; i++) if (i == 0) printf("%03zu", dynamic_last(lines)[i]); else printf(", %03zu", dynamic_last(lines)[i]);
        // printf("\n");
    }
    // printf("ColLen = %zu\n", colLen);
    size_t result = 0;
    for(size_t i = 0; i < colLen; i++) {
        size_t operation = dynamic_last(lines)[i];
        size_t localResult = operation;
        for(size_t j = 0; j < lines.length - 1; j++) {
            if (operation) localResult *= lines.data[j][i];
            else localResult += lines.data[j][i];
        }
        result += localResult;
    }

    printf("Result: %zu\n", result);
    return 0;
}
