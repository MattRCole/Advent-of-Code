#include <string.h>
#include <stdio.h>
#include "../util.h"

#define INPUT_PATH "./06/input.txt"
// #define INPUT_PATH "./06/example.txt"

#define BUFFER_SIZE 30

dynamic_array(FileLines, char *);
dynamic_array(Numbers, size_t);

int main() {
    FileLines fileLines = new_dynamic_arr(3, 0, char *, NULL);

    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t lineLen;
    size_t lineNo = 0;
    size_t colLen = 0;

    while((lineLen = getline(&line, &lineCapp, input)) > 0) {
        lineNo++;
        if (lineNo == 1) { for(size_t i = 0; i < lineLen; i++) if (i == 0 || (line[i - 1] == ' ' && isNumeric(line[i]))) colLen++; }
        // add_dynamic_item(mathLines, calloc(colLen, sizeof(size_t)));
        add_dynamic_item(fileLines, calloc(lineLen + 1, sizeof(char)));
        strncpy(dynamic_last(fileLines), line, line[lineLen - 1] == '\n' ? lineLen - 1 : lineLen);

        char numberBuffer[BUFFER_SIZE] = {0};
        size_t offset = 0;
        size_t colIndex = 0;
        
        // printf("%03zu (count: %05zd): %s", lineNo, lineLen, line);
        // if (line[lineLen - 1] != '\n') printf("\n");
        // printf("Copied line (len: %zu): '%s'\n", strlen(dynamic_last(fileLines)), dynamic_last(fileLines));
    }
    char *operationLine = dynamic_last(fileLines);
    Numbers numbers = new_dynamic_arr(0, 0, size_t, NULL);
    const size_t nonOpLineCount = fileLines.length - 1;
    size_t result = 0;
    for(size_t i = 0; i < strlen(operationLine); i++) {
        // reset our buffers
        dynamic_erase_all(numbers);
        assert(operationLine[i] != ' ', "Starting with a space at position %zu\n", i);


        size_t start = i;
        while(i+1 == strlen(operationLine) || (i + 1 < strlen(operationLine) && operationLine[i + 1] == ' ')) i++;
        size_t end = i;
        for(size_t col = start; col < end; col++) {
            add_dynamic_item(numbers, 0);
            size_t tenPower = 0;
            for(ssize_t lineIdx = (ssize_t)(nonOpLineCount - 1); lineIdx >= 0; lineIdx--) {
                if (fileLines.data[lineIdx][col] == ' ') continue;

                dynamic_last(numbers) += powTenLL(tenPower) * getNumericFromAscii(fileLines.data[lineIdx][col]);
                tenPower++;
            }
        }
        // printf("For idx %zu-%zu got the following numbers: ", start, end);
        // for(size_t j = 0; j < numbers.length; j++) if (j == 0) printf("%zu", dynamic_first(numbers)); else printf(", %zu", numbers.data[j]);
        // printf("\n");
        size_t operation = operationLine[start] == '*' ? 1 : 0;
        size_t localResult = operation;

        for(size_t j = 0; j < numbers.length; j++) {
            if (operation) localResult *= numbers.data[j]; else localResult += numbers.data[j];
        }
        result += localResult;
    }

    printf("Result: %zu\n", result);
    return 0;
}
