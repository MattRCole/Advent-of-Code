#include <string.h>
#include <stdio.h>
#include "../util.h"

// #define INPUT_PATH "./09/input.txt"
#define INPUT_PATH "./09/example.txt"

typedef struct {
    ssize_t x;
    ssize_t y;
} Vec2;


dynamic_array(VectorList, Vec2);

int main() {
    VectorList vectors = empty_dynamic_arr(Vec2);

    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t rawLineLen;
    size_t lineNo = 0;
    size_t maxX, maxY, minX, minY;

    minX = minY = ((size_t)0) - 1;
    maxX = maxY = 0;
    while((rawLineLen = getline(&line, &lineCapp, input)) > 0) {
        lineNo++;
        // printf("%03zu (count: %05zd): %s", lineNo, rawLineLen, line);
        // if (line[rawLineLen - 1] != '\n') printf("\n");
        size_t lineLen = line[rawLineLen - 1] == '\n' ? rawLineLen - 1 : rawLineLen;
        size_t x, y;
        x = y = 0;
        // copy from day 8 lol
        for(ssize_t i = lineLen - 1; i >= 0; i--) {
            size_t pow10 = 0;
            while(line[i] != ',') {
                y += getNumericFromAscii(line[i]) * powTenLL(pow10);
                i--;
                pow10++;
            }
            i--;
            pow10 = 0;
            while(i >= 0) {
                x += getNumericFromAscii(line[i]) * powTenLL(pow10);
                i--;
                pow10++;
            }
        }
        maxX = max(x, maxX);
        maxY = max(y, maxY);
        minX = min(x, minX);
        minY = min(y, minY);
        add_dynamic_item(vectors, ((Vec2){.x=x, .y=y}));
    }

    size_t maxArea = 0;
    for(size_t i = 0; i < vectors.length; i++) {
        // printf("#%zu x=%ld, y=%ld\n", i, d_at(vectors, i).x, d_at(vectors, i).y);
        for(size_t j = i + 1; j < vectors.length; j++) {
            size_t area = (labs(d_at(vectors, i).x - d_at(vectors, j).x) + 1) * (labs(d_at(vectors, i).y - d_at(vectors, j).y) + 1);
            maxArea = max(area, maxArea);
        }
    }
    // printf("vectors.size=%zu\n", vectors.size);
    printf("Max X: %zu, max Y: %zu\n", maxX, maxY);
    printf("Min X: %zu, min Y: %zu\n", minX, minY);
    printf("Max area: %zu\n", maxArea);

    return 0;
}
