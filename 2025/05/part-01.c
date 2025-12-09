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

// #define new_range(range_name, start, end) RangeLinkedListT *range_name = newRange((start), (end)); do {\
//     size_t decommissionedIndex__ = 0; \
//     for(; decommissionedIndex__ < decommissionedPointers.length; decommissionedIndex__++) if (decommissionedPointers.data[decommissionedIndex__] == range_name) break; \
//     if (decommissionedIndex__ < decommissionedPointers.length) { \
//         printf("Re-using old range address. Removing %p from decommissionedPointers at index %zu\n", range_name, decommissionedIndex__); \
//         remove_dynamic_item(decommissionedPointers, decommissionedIndex__); \
//     } \
// } while (0)

// dynamic_array(TestingArray, RangeLinkedListT);
// int main() {

//     TestingArray myArr = new_dynamic_arr(5, 0, RangeLinkedListT, NULL);
//     add_dynamic_item(myArr, ((RangeLinkedListT){.start=5, .end=10, .next=NULL}));
//     add_dynamic_item_at(myArr, ((RangeLinkedListT){.start=1, .end=4, .next=NULL}), 0);
//     add_dynamic_item_at(myArr, ((RangeLinkedListT){.start=0, .end=0, .next=NULL}), 0);
//     add_dynamic_item(myArr, ((RangeLinkedListT){.start=12, .end=15, .next=NULL}));
//     add_dynamic_item(myArr, ((RangeLinkedListT){.start=17, .end=19, .next=NULL}));
//     remove_dynamic_item(myArr, 3);
//     add_dynamic_item(myArr, ((RangeLinkedListT){.start=21, .end=23, .next=NULL}));
//     printf("Length: %zu, size: %zu\n", myArr.length, myArr.size);
//     for(size_t i = 0; i < myArr.length; i++) {
//         printf("#%zu: %zu-%zu\n", i, myArr.data[i].start, myArr.data[i].end);
//     }
// }

// dynamic_array(RangeLinkedListPointerArr, RangeLinkedListT *);


// #define print_curr printf("curr->start=%zu, curr->end=%zu, curr->next=%p\n", curr->start, curr->end, curr->next)
// #define print_ptrs do { RangeLinkedListT *_ccur__ = head; while(_ccur__) { if (_ccur__ == head) printf("%p", _ccur__); else printf("->%p", _ccur__); _ccur__ = _ccur__->next; } printf("\n"); } while (0)


int main() {
    // RangeLinkedListPointerArr decommissionedPointers = new_dynamic_arr(100, 0, RangeLinkedListT *, NULL);
    RangeLinkedListT *head = NULL;
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t lineLen;
    size_t lineNo = 0;
    
    // printf("Ranges:\n");
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
        // printf("computing #%03zu: %zu-%zu\n", lineNo, startI, endI);

        if (line[lineLen - 1] != '\n') printf("\n");
        if (head == NULL) {
            head = newRange(startI, endI);
            continue;
        }

        RangeLinkedListT *curr = head;
        RangeLinkedListT *prev = NULL;
        while (curr) {
            // printf("curr=%p\n", curr);
            // printf("checking range: %02zu-%02zu\n", curr->start, curr->end);
            // for(size_t i = 0; i < decommissionedPointers.length; i++) {
            //     if (curr == decommissionedPointers.data[i] || curr->next == decommissionedPointers.data[i]) {
            //         // print_ptrs;
            //         assert(curr != decommissionedPointers.data[i], "Using a decommissioned pointer for curr! curr=%p\n", curr);
            //         assert(curr->next != decommissionedPointers.data[i], "curr->next is a decommissioned pointer!! next=%p\n", curr->next);
            //     }
            // }
            // if (curr->end < startI || curr->start > endI || (curr->start <= startI && curr->end >= endI) || ((startI <= curr->start || endI >= curr->end) && null_or(curr->next->start > endI)) {
            if (curr->end < startI) {
                if (curr->next == NULL) {
                    RangeLinkedListT *range = newRange(startI, endI);
                    // new_range(range, startI, endI);
                    curr->next = range;
                    break;
                }
                prev = curr;
                curr = curr->next;
                continue;
            }
            if (curr->start > endI) {
                RangeLinkedListT *range = newRange(startI, endI);
                // new_range(range, startI, endI);
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
                // New range starts earlier than the current range.
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
                        // add_dynamic_item(decommissionedPointers, oldNext);
                        // printf("Freeing %p, setting next to %p\n", oldNext, next);
                        free(oldNext);
                        // print_curr;
                        // print_ptrs;
                        continue;
                    } else {
                        // printf("updating curr->end from %zu to %zu and freeing %p and setting curr->next to NULL\n", curr->end, endI, next);
                        curr->end = endI;
                        curr->next = NULL;
                        // add_dynamic_item(decommissionedPointers, next);
                        free(next);
                        // print_curr;
                        // print_ptrs;
                        break;
                    }
                }
                if (next->start > endI) {
                    // printf("updating curr->end from %zu to %zu and updating curr->next from %p to %p\n", curr->end, endI, curr->next, next);
                    curr->next = next;
                    curr->end = endI;
                    // print_curr;
                    // print_ptrs;
                    break;
                }
                else {
                    // printf("updating curr->end from %zu to %zu, updating curr->start from %zu to %zu and updating curr->next from %p to %p and freeing %p\n", curr->end, max(endI, next->end), curr->start, min(startI, curr->start), curr->next, next->next, next);
                    curr->start = min(startI, curr->start);
                    curr->end = max(endI, next->end);
                    curr->next = next->next;
                    // add_dynamic_item(decommissionedPointers, next);
                    free(next);
                    // print_curr;
                    // print_ptrs;
                    break;
                }
            }
        }
        // curr = head;
        // size_t rangeCount = 0;
        // while (curr) {
        //     rangeCount++;
        //     printf("Range #%zu: %zu-%zu\n", rangeCount, curr->start, curr->end);
        //     curr = curr->next;
        // }
    }
    RangeLinkedListT *curr = head;
    size_t rangeCount = 0;
    while(curr) {
        rangeCount++;
        // printf("Range #%02zu: %02zu-%02zu\n", rangeCount, curr->start, curr->end);
        curr = curr->next;
    }
    // printf("Range Count %zu\n", rangeCount);
    RangeLinkedListT **ranges = malloc(sizeof(RangeLinkedListT *) * rangeCount);
    curr = head;

    // printf("Hi\n");
    for(size_t i = 0; i < rangeCount; i++) {
        ranges[i] = curr;
        // printf("Range #%03zu: %zu-%zu\n", i+1, ranges[i]->start, ranges[i]->end);
        curr = curr->next;
    }
    // printf("Bye\n");
    // printf("Ids:\n");
    size_t freshCount = 0;
    while((lineLen = getline(&line, &lineCapp, input)) > 0) {
        lineNo++;
        // printf("LineNo=%zu\n", lineNo);
        size_t number = atoll(line);
        // printf("%03zu (count: %05zd): %zu\n", lineNo, lineLen, number);

        size_t left, right;
        left = 0; right = rangeCount;
        while (left < right) {
            size_t middle = left + ((right - left) / 2);
            // printf("left=%zu, right=%zu, middle=%zu, rangeCount=%zu\n", left, right, middle, rangeCount);
            RangeLinkedListT *range = ranges[middle];
            if (range->start <= number && range->end >= number) {
                freshCount++;
                break;
            } else if (range->end < number) {
                left = middle + 1;
            } else {
                right = middle;
            }
        }
    }

    fclose(input);

    // printf("Bye\n");

    printf("Fresh count: %zu\n", freshCount);

    return 0;
};
