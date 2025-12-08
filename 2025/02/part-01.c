#include <string.h>
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include "../util.h"

#define INPUT_PATH "./02/input.txt"
// #define INPUT_PATH "./02/example.txt"

#define BUFFER_SIZE 200

typedef struct {
    char *start;
    char *end;
    size_t startI;
    size_t endI;
} Range;


#define ten_to_pow(power, result_out) do { (result_out) = 1; for(size_t i = 0; i < (power); i++) result_out = result_out * 10; } while (0) 

#define itoa(num, digit_count, buffer_out) do { size_t curNum = (num); for(size_t i = (digit_count); i < 0; --i) { (buffer_out)[i] = 0x30 + curNum % 10; curNum = curNum / 10; } } while (0)

#define double_str_num(str_num, buffer_out) do { size_t strLen = strlen(str_num); for(size_t i = 0; i < strLen * 2; i++) { (buffer_out)[i] = (str_num)[i % strLen]; } }

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
        size_t startLen = strnlen(start, BUFFER_SIZE);
        size_t endLen = strnlen(end, BUFFER_SIZE);
        
        printf("Got range! start='%s', end='%s', startLen=%zu, endLen=%zu, startI=%zu, endI=%zu\n", start,end,startLen,endLen,startI,endI);
        // if it's odd and doesn't cross an even range, skip.
        if (startLen % 2 == 1 && endLen == startLen) { continue; }

        size_t currLen = startLen % 2 == 1 ? startLen + 1 : startLen;
        while (currLen <= endLen) {
            if (currLen % 2 == 1) {
                currLen++;
                continue;
            }
            int64_t startTop, startBottom, endTop, endBottom;

            ten_to_pow((currLen / 2) - 1, startTop);
            ten_to_pow((currLen / 2) - 1, startBottom);
            ten_to_pow((currLen / 2), endTop);

            endTop -= 1;
            endBottom = endTop;

            ssize_t expStart = -1;
            ssize_t expEnd = -1;
            if (currLen == startLen) {
                ten_to_pow((currLen / 2), expStart);
                startTop = startI / expStart;
                startBottom = startI % expStart;
            }
            
            if (endLen == currLen) {
                ten_to_pow((currLen / 2), expEnd);
                endTop = endI / expEnd;
                endBottom = endI % expEnd;
            }
            
            printf("Start Top: %lld, startBottom: %lld, expStart: %lu, endTop:%lld endBottom: %lld expEnd: %lu\n", startTop, startBottom, expStart, endTop, endBottom, expEnd);
            while (startTop < endTop || (startTop == endTop && startBottom <= endBottom)) {
                if (startTop == startBottom) {
                    int64_t exponent;
                    ten_to_pow((currLen / 2), exponent);
                    invalidIds[count] = (startTop * exponent) + startTop;
                    printf("idx: %zu, val: %lld, startTop=%lld\n", count, invalidIds[count], startTop);
                    count++;
                    startTop += 1;
                    startBottom += 1;
                } else  {
                    if (startTop < startBottom) startTop++;
                    startBottom = startTop;
                }
            }
            currLen++;
        }

    } while (nextChar != EOF);
    size_t sum = 0;
    for (size_t i = 0; i < count; i++) { sum += invalidIds[i];  }
    printf("count: %zu, sum: %zu\n", count, sum);
    return 0;
}
