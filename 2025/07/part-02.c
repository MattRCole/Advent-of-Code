#include <string.h>
#include <stdio.h>
#include "../util.h"

// #define INPUT_PATH "./07/input.txt"
#define INPUT_PATH "./07/example.txt"

dynamic_array(FileLines, char *);

typedef struct {
    size_t lineIdx;
    size_t colIdx;
} StackFrame;

dynamic_array(StackFrames, StackFrame);

int main() {
    FileLines lines = new_dynamic_arr(0, 0, char *, NULL);
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t rawLineLen;
    
    while((rawLineLen = getline(&line, &lineCapp, input)) > 0) {
        add_dynamic_item(lines, calloc(rawLineLen + 1, sizeof(char)));
        strncpy(dynamic_last(lines), line, line[rawLineLen - 1] == '\n' ? rawLineLen - 1 : rawLineLen);
    }

    StackFrames frames = new_dynamic_arr(0, 0, StackFrame, NULL);
    for(size_t i = 0; i < strlen(dynamic_first(lines)); i++) {
        if (dynamic_first(lines)[i] == 'S') {
            add_dynamic_item(frames, ((StackFrame){ .lineIdx=1, .colIdx=i}));
            break;
        }
    }
    assert(frames.length > 0, "Could not find starting position!!!");
    // printf("Initial colIdx: %zu\n", frames.data[0].colIdx);
    const size_t lineLen = strlen(dynamic_first(lines));

    // recursion is for noobs.
    size_t timelineTotal = 0;
    // size_t maxFrames, minFrames;
    // maxFrames = minFrames = 0;
    while(frames.length) {
        printf("\rrunning total: %010zu, frames: %05zu", timelineTotal, frames.length);
        // printf("\n%zu frames left...\n", frames.length);
        // if (frames.length > maxFrames) {
        //     if (maxFrames != 0) {
        //         printf("prev minFrames: %zu, new maxFrames: %zu\n", minFrames, maxFrames);
        //     }
        //     maxFrames = frames.length;
        // }
        // minFrames = min(minFrames, frames.length);
        StackFrame frame = {0};
        frame.lineIdx = dynamic_last(frames).lineIdx;
        frame.colIdx = dynamic_last(frames).colIdx;
        dynamic_pop(frames);
        // printf("Frames left: %zu\n", frames.length);
        // printf("New frame: Starting line: %zu, starting col: %zu\n", frame.lineIdx, frame.colIdx);
        // for(size_t i = 0; i < frame.lineIdx; i++) printf("%03zu %s\n", i, lines.data[i]);
        while (frame.lineIdx < lines.length) {
            char *currLine = lines.data[frame.lineIdx];
            // printf("%03zu %s\n", frame.lineIdx, currLine);
            // printf("    %*c\n", (int)frame.colIdx + 1, '^');
            if (currLine[frame.colIdx] == '^') {
                // printf("splitting...\n");
                if (frame.colIdx + 1 == lineLen) {
                    // dead-end timeline
                    // printf("OOB right\n");
                    timelineTotal++;
                } else {
                    add_dynamic_item(frames, ((StackFrame){ .lineIdx=frame.lineIdx + 1, .colIdx=frame.colIdx+1}));
                    // printf("Adding Right, lineIdx: %zu, colIdx: %zu, lineCount: %zu\n", dynamic_last(frames).lineIdx, dynamic_last(frames).colIdx, lines.length);
                }

                if ((ssize_t)(frame.colIdx) - 1 < 0) {
                    // current timeline is a dead-end
                    // we'll add this timeline at the end of the loop
                    // printf("OOB left\n");
                    break;
                } else {
                    size_t oldIdx = frame.colIdx;
                    frame.colIdx--;
                    // printf("Moving left from %zu to %zu...\n", oldIdx, frame.colIdx);
                }
            }
            frame.lineIdx++;
            // printf("Continuing. lineIdx: %zu\n", frame.lineIdx);
        }
        timelineTotal++;
    }


    printf("\nTime lines: %zu\n", timelineTotal);
    return 0;
}
