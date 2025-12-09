#include <string.h>
#include <stdio.h>
#include "../util.h"

#define INPUT_PATH "./05/input.txt"
// #define INPUT_PATH "./05/example.txt"


typedef struct RangeLinkedListT {
    size_t start;
    size_t end;
    struct RangeLinkedListT *next;
} RangeLinkedListT;

#define null_or(cond) (curr->next == NULL || (cond))

RangeLinkedListT *newRange(size_t start, size_t end) {
    RangeLinkedListT *range = malloc(sizeof(RangeLinkedListT));
    range->start = start;
    range->end = end;
    range->next = NULL;
    return range;
};

int main() {
    RangeLinkedListT *head = NULL;
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t lineLen;
    size_t lineNo = 0;
    
    while((lineLen = getline(&line, &lineCapp, input)) > 1) {
        size_t startI = 0;
        size_t endI = 0;
        char *numBuff = calloc(lineLen + 1, sizeof(char));
        char curChar = '\0';
        int offset = 0;
        for(int i = 0; i < lineLen; i++) {
            if (line[i] == '-') {
                numBuff[i] = '\0';
                offset = i + 1;
                startI = atoll(numBuff);
            }
            if (line[i] == '\n') {
                numBuff[i - offset] = '\0';
                endI = atoll(numBuff);
            }
            numBuff[i-offset] = line[i];
        }
        lineNo++;

        if (line[lineLen - 1] != '\n') printf("\n");
        if (head == NULL) {
            head = newRange(startI, endI);
            continue;
        }

        RangeLinkedListT *curr = head;
        RangeLinkedListT *prev = NULL;
        while (curr) {
            if (curr->end < startI) {
                if (curr->next == NULL) {
                    RangeLinkedListT *range = newRange(startI, endI);
                    curr->next = range;
                    break;
                }
                prev = curr;
                curr = curr->next;
                continue;
            }
            if (curr->start > endI) {
                RangeLinkedListT *range = newRange(startI, endI);
                range->next = curr;
                if (prev == NULL) {
                    head = range;
                } else  {
                    prev->next = range;
                }
                break;
            }
            if (curr->start <= startI && curr->end >= endI) {
                // complete overlap, skipping
                break;
            }
            if (curr->next == NULL || curr->next->start > endI) {
                curr->start = min(startI, curr->start);
                curr->end = max(endI, curr->end);
                break;
            }
            RangeLinkedListT *next = curr->next;
            // (curr->end >= startI) && (curr->start <= endI) && (curr->start > startI || curr->end < endI) && (curr->next != NULL && curr->next->start <= endI);
            while(true) {
                if (next->end < endI) {
                    if (next->next) {
                        RangeLinkedListT *oldNext = next;
                        next = next->next;
                        free(oldNext);
                        continue;
                    } else {
                        curr->end = endI;
                        curr->next = NULL;
                        free(next);
                        break;
                    }
                }
                if (next->start > endI) {
                    curr->next = next;
                    curr->end = endI;
                    break;
                }
                else {
                    curr->start = min(startI, curr->start);
                    curr->end = max(endI, next->end);
                    curr->next = next->next;
                    free(next);
                    break;
                }
            }
        }
    }
    RangeLinkedListT *curr = head;
    size_t freshIdsCount = 0;
    while(curr) {
        freshIdsCount += 1 + curr->end - curr->start;
        curr = curr->next;
    }

    fclose(input);

    printf("Fresh IDs total: %zu\n", freshIdsCount);

    return 0;
};
