#include <string.h>
#include <stdio.h>
#include "../util.h"

// #define INPUT_PATH "./00/input.txt"
#define INPUT_PATH "./00/example.txt"

int main() {
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t lineLen;
    size_t lineNo = 0;
    
    while((lineLen = getline(&line, &lineCapp, input)) > 0) {
        lineNo++;
        printf("%03zu (count: %05zd): %s", lineNo, lineLen, line);
    }

    return 0;
}
