#include <string.h>
#include <stdio.h>
#include "../util.h"
#include <pthread.h>
#include <unistd.h>

#define INPUT_PATH "./09/input.txt"
// #define INPUT_PATH "./09/example.txt"

// #define PICTURE_PATH "./09/img.ppm"
#define BOXES_TO_TRACK 122760
// #define BOXES_TO_SKIP 7000
#define BOXES_TO_SKIP 0
#define CHUNK_SIZE 10000
#define THREAD_COUNT 10

typedef struct {
    ssize_t x;
    ssize_t y;
} Vec2;

typedef struct {
    ssize_t minX;
    ssize_t minY;
    ssize_t maxX;
    ssize_t maxY;
    Vec2 corner1;
    Vec2 corner2;
    size_t area;
} Box;

dynamic_array(VectorList, Vec2);
dynamic_array(BoxList, Box);


typedef enum {
    DIR_UP,
    DIR_RIGHT,
    DIR_DOWN,
    DIR_LEFT,
    DIR_INVALID,
} Direction;

char *DirectionNames[] = {
    "DIR_UP",
    "DIR_RIGHT",
    "DIR_DOWN",
    "DIR_LEFT",
    "DIR_INVALID",
};


typedef struct {
    size_t start;
    size_t end;
    Direction insideDirection;
} Line;

dynamic_array(LineList, Line);

typedef struct {
    size_t idx;
    LineList lines;
} LineContainer;


dynamic_array(SparseLines, LineContainer);

typedef struct {
    Box *boxes;
    size_t boxesToCheck;
    size_t boxOffset;
    SparseLines *verticalLines;
    SparseLines *horizontalLines;
    size_t workerId;
    bool done;
} WorkerInfo;


static ssize_t workerResultOut[THREAD_COUNT] = {
    -1, -1, -1, -1, -1, -1, -1, -1, -1, -1 
};

#define get_travel_direction(start_vec, end_vec) ((start_vec).x == (end_vec).x \
    ? ((start_vec).y < (end_vec).y ? DIR_UP : DIR_DOWN) \
    : ((start_vec).x < (end_vec).x ? DIR_RIGHT : DIR_LEFT))

#define get_reflected_direction(direction) (((direction) + 2) % DIR_INVALID)
#define get_clockwise_direction(direction) (((direction) + 1) % DIR_INVALID)
#define get_ccw_direction(direction) (((direction) + 3) % DIR_INVALID)


void *workerFn(void *arg) {
    WorkerInfo *info = (WorkerInfo *)arg;

    info->done=false;

    for (size_t bx = 0; bx < info->boxesToCheck; bx++) {
        size_t boxIdx = bx + info->boxOffset;
        // if (bx == 0) {
        //     printf("First box to check: %zu\n", boxIdx);
        // }
        Box box = info->boxes[boxIdx];
        Line vertLine = { .start=box.minY, .end=box.maxY };
        Line horizLine = { .start=box.minX, .end=box.maxX };

        bool invalid = false;
        for(size_t i = 0; i < 2; i++) {
            Line firstTestLine =  (i % 2) == 0 ? vertLine  : horizLine;
            Line secondTestLine = (i % 2) == 0 ? horizLine : vertLine;
            SparseLines *sparseLines = (i % 2) == 0 ? info->horizontalLines : info->verticalLines;
            bool found = false;
            size_t idx = 0;
            dynamic_bin_search(*sparseLines, d_at(*sparseLines, idx).idx == firstTestLine.start, firstTestLine.start < d_at(*sparseLines, idx).idx, found, idx);

            while(idx < sparseLines->length && d_at(*sparseLines, idx).idx < firstTestLine.end) {
                if (d_at(*sparseLines, idx).idx <= firstTestLine.start) {
                    idx++;
                    continue;
                }
                LineList lines = d_at(*sparseLines, idx).lines;
                size_t jdx = 0;
                dynamic_bin_search(lines, d_at(lines, jdx).end == secondTestLine.start, secondTestLine.start < d_at(lines, jdx).end, found, jdx);
                while(jdx < lines.length && d_at(lines, jdx).start < secondTestLine.end) {
                    if(d_at(lines, jdx).end <= secondTestLine.start) {
                        jdx++;
                        continue;
                    }
                    invalid = true;
                    break;
                }
                if (invalid) break;
                idx++;
            }
            if (invalid) break;
        }
        if (invalid) continue;
        // now we do the in-bounds check
        printf("%zu is a potential result\n", boxIdx);
        for(size_t i = 0; i < 2; i++) {
            Vec2 point = i == 0 ? box.corner1 : box.corner2;
            Vec2 oppPoint = i == 0 ? box.corner2 : box.corner1;
            Direction vertToInside = get_travel_direction(point, ((Vec2){.x=oppPoint.x, .y=point.y}));
            Direction horizToInsize = get_travel_direction(point, ((Vec2){.x=point.x, .y=oppPoint.y}));
            assert((vertToInside == DIR_LEFT || vertToInside == DIR_RIGHT) && (horizToInsize == DIR_UP || horizToInsize == DIR_DOWN), "Got an invalid direction: vert=%s, horiz=%s\n", DirectionNames[vertToInside], DirectionNames[horizToInsize]);
            bool found = false;
            size_t idx = 0;
            dynamic_bin_search(*info->verticalLines, d_at(*info->verticalLines, idx).idx == point.x, point.x < d_at(*info->verticalLines, idx).idx, found, idx);
            // This is guaranteed basically.
            assert(found, "Tried to find a vertical line at %zu for point x=%zu, y=%zu for box %zu but couldn't!!!\n", point.x, point.x, point.y, boxIdx);

            LineList verticalLines = d_at(*info->verticalLines, idx).lines;
            dynamic_bin_search(verticalLines, d_at(verticalLines, idx).start == point.y || d_at(verticalLines, idx).end == point.y, point.y < d_at(verticalLines, idx).start, found, idx);
            assert(found, "Tried to find a vertical line starting or ending at %zu on x axis %zu but failed to do so! boxIdx=%zu\n", point.y, point.x, boxIdx);

            // so, at this point, we've found a line that is "co-linear" with the vertical component of our box corner.
            Line foundVertLine = d_at(verticalLines, idx);

            // let's do the same thing for horizontal lines now.
            dynamic_bin_search(*info->horizontalLines, d_at(*info->horizontalLines, idx).idx == point.y, point.y < d_at(*info->horizontalLines, idx).idx, found, idx);
            assert(found, "asdfasdf\n");
            LineList horizontalLines = d_at(*info->horizontalLines, idx).lines;
            dynamic_bin_search(horizontalLines, d_at(horizontalLines, idx).start == point.x || d_at(horizontalLines, idx).end == point.x, point.x < d_at(horizontalLines, idx).start, found, idx);
            assert(found, "Tried to find a point or something. x=%ld,y=%ld\n", point.x, point.y);
            Line foundHorizLine = d_at(horizontalLines, idx);

            /*
                There are two cases: 1 line overlaps with box, two lines overlap with box or no lines overlap with box.
                So, if two or no lines overlap with the box, both directions need to match.

                consider the two situations with complete overlap and no overlap:
                    OOB AREA    | IB AREA
                     -----------+--------
                     IB  AREA   | BOX AREA

                    +-------------------+----------
                    |                   |
                    | BOX AREA          | IB AREA
                    |                   |
                    +-------------------+
                    | IB AREA

                In this situation, both boundary line inner-directions must match the box's inner directions.

                But if only one line overlaps:

                        |
                        |
                        +-----------+-----------
                        | BOX AREA  |
                        +-----------+

                Than only the one overlapping line's direction really matters.
            */

            bool horizontalOverlap = point.x == box.minX && foundHorizLine.start == point.x || point.x == box.maxX && foundHorizLine.end == point.x;
            bool verticalOverlap = point.y == box.minY && foundVertLine.start == point.y || point.y == box.maxY && foundVertLine.end == point.y;
            if ((verticalOverlap ^ horizontalOverlap) == 0) {
                invalid = foundHorizLine.insideDirection != horizToInsize || foundVertLine.insideDirection != vertToInside;
            } else if (horizontalOverlap) {
                invalid = foundHorizLine.insideDirection != horizToInsize;
            } else {
                invalid = foundVertLine.insideDirection != vertToInside;
            }

            // if (box.area == 24) {
            //     printf("Point: x=%zu,y=%zu horizInside=%s, vertInside=%s\n", point.x, point.y, DirectionNames[horizToInsize], DirectionNames[vertToInside]);
            //     printf("\tPoint Horizontal line: %zu-%zu\n", horizLine.start, horizLine.end);
            //     printf("\tPoint Vertical line: %zu-%zu\n", vertLine.start, vertLine.end);
            //     printf("\t------\n");
            //     printf("\tHorizontal line: %zu-%zu, inside: %s\n", foundHorizLine.start, foundHorizLine.end, DirectionNames[foundHorizLine.insideDirection]);
            //     printf("\tVertical line: %zu-%zu, inside: %s\n", foundVertLine.start, foundVertLine.end, DirectionNames[foundVertLine.insideDirection]);
            //     printf("\tVertical overlap: %s, horizontal overlap: %s\n", verticalOverlap ? "true": "false", horizontalOverlap ? "true" : "false");
            // }
            if (invalid) break;

        }
        if (invalid) continue;

        printf("Found a result!!! %zu\n", boxIdx);
        workerResultOut[info->workerId] = boxIdx;
        break;
    }
    info->done = true;
    pthread_exit(NULL);
}

typedef struct {
    size_t cellIdx;
    size_t vectorIdx;
} Point;

dynamic_array(PointList, Point);

typedef struct {
    size_t idx;
    PointList points;
} SparseMatrixContainer;

dynamic_array(SparseMatrix, SparseMatrixContainer);

typedef enum {
    CLOCK_WISE,
    COUNTER_CLOCK_WISE,
    ROT_INVALID,
} Rotation;

void wrapShape(VectorList vectors, SparseLines *verticalLines, SparseLines *horizontalLines) {
    VectorList reducedShape = empty_dynamic_arr(Vec2);
    SparseMatrix columnRowMatrix = empty_dynamic_arr(SparseMatrixContainer);
    SparseMatrix rowColumnMatrix = empty_dynamic_arr(SparseMatrixContainer);

    Rotation lastRotation = ROT_INVALID;
    Direction lastDirection = DIR_INVALID;
    ssize_t wiseDetector = 0;


    for(size_t i = 0; i < vectors.length; i++) {
        Vec2 vec = d_at(vectors, i);
        Vec2 nec = d_at(vectors, (i + 1) % vectors.length);
        Direction currDirection = get_travel_direction(vec, nec);
        Rotation currRotation;
        size_t rotationCount = 1;
        if (lastDirection != DIR_INVALID) {
            if (get_reflected_direction(currDirection) == lastDirection) {
                printf("We just turned around! :D\n");
                assert(lastRotation != ROT_INVALID, "We turned around but we don't know our last rotation so we can't say our curren't rotation!\n");
                currRotation = (lastRotation + 1) % ROT_INVALID;
                rotationCount = 2;
            } else if (get_clockwise_direction(lastDirection) == currDirection) {
                currRotation = CLOCK_WISE;
            } else if (get_ccw_direction(lastDirection) == currDirection) {
                currRotation = COUNTER_CLOCK_WISE;
            } else {
                fail("We were going %s, now we're going %s and somehow that's invalid.\n", DirectionNames[lastDirection], DirectionNames[currDirection]);
            }
            lastRotation = currRotation;
            wiseDetector += (currRotation == CLOCK_WISE ? 1 : -1) * rotationCount;
        }
        lastDirection = currDirection;
    }

    // (dir + 3) % 4 is basically dir - 1 but without any funky stuff happening at -1
    size_t turnInside = wiseDetector < 0 ? 3 : 1;

    for(size_t i = 0; i < vectors.length; i++) {
        Vec2 vec = d_at(vectors, i);
        Vec2 nec = d_at(vectors, (i + 1) % vectors.length);
        bool found = false;
        Direction currDirection = get_travel_direction(vec, nec);
        Direction insideDirection = (currDirection + turnInside) % DIR_INVALID;
        // printf("Heading %s and the inside is on the %s side\n", DirectionNames[currDirection], DirectionNames[insideDirection]);

        size_t idx = 0;
        if (columnRowMatrix.length == 0) {
            SparseMatrixContainer column = {
                .idx=vec.x,
                .points=((PointList)empty_dynamic_arr(Point)),
            };
            add_dynamic_item(column.points, ((Point){ .cellIdx=vec.y, .vectorIdx=i }));
            add_dynamic_item(columnRowMatrix, column);
        } else {
            dynamic_bin_search(columnRowMatrix, (d_at(columnRowMatrix, idx).idx == vec.x), (vec.x < d_at(columnRowMatrix, idx).idx), found, idx);
            if (found) {
                PointList *points = &(d_at(columnRowMatrix, idx).points);
                assert(points->length > 0, "Somehow there's an empty list at column %zu, vector idx: %zu\n", d_at(columnRowMatrix, idx).idx, i);
                dynamic_bin_search((*points), d_at(*points, idx).cellIdx == vec.y, vec.y < d_at(*points, idx).cellIdx, found, idx);
                if (d_at(*points, idx).cellIdx < vec.y) idx++;
                add_dynamic_item_at(*points, ((Point){ .cellIdx=vec.y, .vectorIdx=i }), idx);
            } else {
                if (d_at(columnRowMatrix, idx).idx < vec.x) idx++;
                add_dynamic_item_at(columnRowMatrix, ((SparseMatrixContainer){ .idx=vec.x, .points=((PointList)empty_dynamic_arr(Point)) }), idx);
                add_dynamic_item(d_at(columnRowMatrix, idx).points, ((Point){ .cellIdx=vec.y, .vectorIdx=i }));
            }
        }
        if (rowColumnMatrix.length == 0) {
            SparseMatrixContainer row = {
                .idx=vec.y,
                .points=((PointList)empty_dynamic_arr(Point))
            };
            add_dynamic_item(row.points, ((Point){ .cellIdx=vec.x, .vectorIdx=i }));
            add_dynamic_item(rowColumnMatrix, row);
            // printf("Added first row: %zu to sparse rowCol matrix\n", rowColumnMatrix.data[0].idx);
        } else {
            found = false;
            idx = 0;
            dynamic_bin_search(rowColumnMatrix, (rowColumnMatrix.data[idx].idx == vec.y), (vec.y < rowColumnMatrix.data[idx].idx), found, idx);
            if (found) {
                // printf("Found row: %zu in sparse rowCol matrix\n", rowColumnMatrix.data[idx].idx);
                PointList *points = &(d_at(rowColumnMatrix, idx).points);
                assert(points->length > 0, "Somehow there's an empty list at row %zu, vector idx: %zu\n", d_at(rowColumnMatrix, idx).idx, i);
                dynamic_bin_search((*points), points->data[idx].cellIdx == vec.x, vec.x < points->data[idx].cellIdx, found, idx);
                if (d_at(*points, idx).cellIdx < vec.x) idx++;
                add_dynamic_item_at(*points, ((Point){ .cellIdx=vec.x, .vectorIdx=i }), idx);
            } else {
                if ((d_at(rowColumnMatrix, idx).idx) < vec.y) idx++;
                // printf("Could not find row: %zu in sparse rowCol matrix. Inserting into index %zu", vec.y, idx);
                // if (idx == 0) printf(" at the beginning of list ahead of row %zu\n", dynamic_first(rowColumnMatrix).idx);
                // else if (idx == rowColumnMatrix.length) printf(" at the end of the list right after row %zu\n", dynamic_last(rowColumnMatrix).idx);
                // else printf(" between rows %zu and %zu\n", d_at(rowColumnMatrix, idx - 1).idx, d_at(rowColumnMatrix, idx).idx);
                add_dynamic_item_at(rowColumnMatrix, ((SparseMatrixContainer){ .idx=vec.y, .points=((PointList)empty_dynamic_arr(Point)) }), idx);
                add_dynamic_item(d_at(rowColumnMatrix, idx).points, ((Point){ .cellIdx=vec.x, .vectorIdx=i }));
            }
        }

        size_t start, end, lineIdx;
        SparseLines *lineContainer;

        if (vec.x == nec.x) {
            lineIdx = vec.x;
            start = min(vec.y, nec.y);
            end = max(vec.y, nec.y);
            lineContainer = verticalLines;

        } else {
            lineIdx = vec.y;
            start = min(vec.x, nec.x);
            end = max(vec.x, nec.x);
            lineContainer = horizontalLines;

        }

        if (lineContainer->length == 0) {
            LineContainer newCont = { .idx=lineIdx, .lines=((LineList)empty_dynamic_arr(Line)) };
            add_dynamic_item(newCont.lines, ((Line){ .start=start, .end=end, .insideDirection=insideDirection }));
            add_dynamic_item(*lineContainer, newCont);
            continue;
        }
        dynamic_bin_search((*lineContainer), (lineContainer->data[idx]).idx == lineIdx, lineIdx < (lineContainer->data[idx]).idx, found, idx);
        if (found) {
            LineContainer *lineGroup = &(d_at(*lineContainer, idx));
            LineList *lines = &lineGroup->lines;
            dynamic_bin_search(
                *lines,
                end >= (lines->data[idx].start) && start <= (lines->data[idx].end),
                end < (lines->data[idx].start),
                found,
                idx
            );
            if (found) {
                // we found an overlapping line.
                fail(
                    "AAAAAAAAA! I DON'T WANT TO THINK ABOUT THIS!!! Overlapping at %s %zu. new start=%zu new end=%zu, overlapping start=%zu overlapping end=%zu\n",
                    vec.x == nec.x ? "row" : "column",
                    lineGroup->idx,
                    start,
                    end,
                    lines->data[idx].start,
                    lines->data[idx].end
                );
            } else {
                if (lines->data[idx].end < start) idx++;
                add_dynamic_item_at(*lines, ((Line){ .start=start, .end=end, .insideDirection=insideDirection }), idx);
            }
        } else {
            if (lineContainer->data[idx].idx < lineIdx) idx++;
            LineContainer newCont = { .idx=lineIdx, .lines=((LineList)empty_dynamic_arr(Line)) };
            add_dynamic_item(newCont.lines, ((Line){.start=start, .end=end, .insideDirection=insideDirection }));
            add_dynamic_item_at(*lineContainer, newCont, idx);
        }
    }
    // for(size_t i = 0; i < columnRowMatrix.length; i++) {
    //     if (i != 0) assert(d_at(columnRowMatrix, i - 1).idx < d_at(columnRowMatrix, i).idx, "Out of order columns!!!\n");
    //     SparseMatrixContainer col = d_at(columnRowMatrix, i);
    //     PointList rows = col.points;
    //     printf("Points in col %zu:\n\t- ", col.idx);
    //     for(size_t j = 0; j < rows.length; j++) printf("%zu (%zu) ", d_at(rows, j).cellIdx, d_at(rows, j).vectorIdx);
    //     printf("\n");
    // }
    // printf("%zu columns in total\n", columnRowMatrix.length);
    size_t horizontalLineTotal = 0;
    size_t verticalLineTotal = 0;
    for(size_t i = 0; i < horizontalLines->length; i++) horizontalLineTotal += d_at(*horizontalLines, i).lines.length;
    for(size_t i = 0; i < verticalLines->length; i++) verticalLineTotal += d_at(*verticalLines, i).lines.length;
    for(size_t containerIdx = 0; containerIdx < verticalLines->length; containerIdx++) {
        if (containerIdx + 1 == verticalLines->length) continue;
        LineContainer lineContainer = d_at(*verticalLines, containerIdx);
        LineContainer nextLineContainer = d_at(*verticalLines, containerIdx+1);
        if (lineContainer.idx + 1 != nextLineContainer.idx) continue;
        for(size_t i = 0; i < lineContainer.lines.length; i++) {
            Line line = d_at(lineContainer.lines, i);
            for(size_t j = 0; j < nextLineContainer.lines.length; j++) {
                Line adjacentLine = d_at(nextLineContainer.lines, j);
                if (adjacentLine.end < line.start) continue;
                if (adjacentLine.start > line.end) break;

                printf("Vert line at x=%zu has overlap with line at x=%zu, overlapping y values: %zu-%zu\n", lineContainer.idx, nextLineContainer.idx, max(line.start, adjacentLine.start), min(line.end, adjacentLine.end));
            }
        }
    }
    for(size_t containerIdx = 0; containerIdx < horizontalLines->length; containerIdx++) {
        if (containerIdx + 1 == horizontalLines->length) continue;
        LineContainer lineContainer = d_at(*horizontalLines, containerIdx);
        LineContainer nextLineContainer = d_at(*horizontalLines, containerIdx+1);
        if (lineContainer.idx + 1 != nextLineContainer.idx) continue;
        for(size_t i = 0; i < lineContainer.lines.length; i++) {
            Line line = d_at(lineContainer.lines, i);
            for(size_t j = 0; j < nextLineContainer.lines.length; j++) {
                Line adjacentLine = d_at(nextLineContainer.lines, j);
                if (adjacentLine.end < line.start) continue;
                if (adjacentLine.start > line.end) break;

                printf("Vert line at y=%zu has overlap with line at y=%zu, overlapping x values: %zu-%zu\n", lineContainer.idx, nextLineContainer.idx, max(line.start, adjacentLine.start), min(line.end, adjacentLine.end));
            }
        }
    }
    printf("%zu horizontal lines total, and %zu vertical lines total\n", horizontalLineTotal, verticalLineTotal);
    printf("We ended up turning a total of %ld times, so that means we're tracing a %s loop and the inside is always to the %s-hand side of the direction of travel\n",
        wiseDetector,
        wiseDetector > 0 ? "clock-wise" : "counter-clock-wise",
        wiseDetector > 0 ? "right" : "left"
    );
    // size_t startingVectorIdx = dynamic_first(dynamic_first(rowColumnMatrix).points).vectorIdx;

}


int main() {
    VectorList vectors = empty_dynamic_arr(Vec2);
    BoxList boxes = empty_dynamic_arr(Box);

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
    static SparseLines verticalLines, horizontalLines;
    verticalLines = (SparseLines)empty_dynamic_arr(LineContainer);
    horizontalLines = (SparseLines)empty_dynamic_arr(LineContainer);
    wrapShape(vectors, &verticalLines, &horizontalLines);
    printf("vertLen: %zu, horizLen: %zu\n", verticalLines.length, horizontalLines.length);
    // exit(0);

    // writeOutPath(vectors.size, vectors.length, vectors.data, maxX, maxY, minX, minY);
    size_t discardCount = 0;
    size_t maxArea = 0;
    for(size_t i = 0; i < vectors.length; i++) {
        // printf("#%zu x=%ld, y=%ld\n", i, d_at(vectors, i).x, d_at(vectors, i).y);
        for(size_t j = i + 1; j < vectors.length; j++) {
            Vec2 a = d_at(vectors, i);
            Vec2 b = d_at(vectors, j);
            size_t area = (labs(a.x - b.x) + 1) * (labs(a.y - b.y) + 1);
            Box box = {
                .minX=min(a.x, b.x),
                .minY=min(a.y, b.y),
                .maxX=max(a.x, b.x),
                .maxY=max(a.y, b.y),
                .corner1=a,
                .corner2=b,
                .area=area,
            };

            if (boxes.length == 0) {
                add_dynamic_item(boxes, box);
                continue;
            }
            size_t idx = 0;
            bool found = false;
            dynamic_bin_search(boxes, boxes.data[idx].area == area, area > boxes.data[idx].area, found, idx);
            if (boxes.data[idx].area > area) idx++;
            if (idx >= BOXES_TO_TRACK) {
                discardCount++;
                continue;
            }

            add_dynamic_item_at(boxes, box, idx);
            if (boxes.length > BOXES_TO_TRACK) {
                discardCount++;
                boxes.length = BOXES_TO_TRACK;
            }

            // maxArea = max(area, maxArea);
        }
    }
    // printf("vectors.size=%zu\n", vectors.size);
    printf("Max X: %zu, max Y: %zu\n", maxX, maxY);
    printf("Min X: %zu, min Y: %zu\n", minX, minY);
    // fail("Box %d's points: x=%ld,y=%ld and x=%ld,y=%ld\n", 80006, boxes.data[80006].corner1.x, boxes.data[80006].corner1.y, boxes.data[80006].corner2.x, boxes.data[80006].corner2.y);
    assert(boxes.length > BOXES_TO_SKIP, "Didn't find enough boxes. Needed %d, got %zu\n", BOXES_TO_SKIP, boxes.length);
    printf("Showing top %zu of %zu areas: \n", min(100, boxes.length), boxes.length - BOXES_TO_SKIP);
    for(size_t i = BOXES_TO_SKIP; i < min(100 + BOXES_TO_SKIP, boxes.length); i++) {
        printf("\tidx: %zu, area=%zu, a=(%ld,%ld), b=(%ld,%ld)\n", i, d_at(boxes, i).area, d_at(boxes, i).minX, d_at(boxes, i).minY, d_at(boxes, i).maxX, d_at(boxes, i).maxY);
    }
    printf("Discarded %zu smaller boxes for a grand total of %zu boxes found.\n", discardCount, discardCount + BOXES_TO_TRACK);

    size_t allocatedUpTo = BOXES_TO_SKIP;
    ssize_t result = -1;
    static WorkerInfo workerInfo[THREAD_COUNT] = {0};
    while (allocatedUpTo < boxes.length) {
        pthread_t threads[THREAD_COUNT];
        size_t workerCount = 0;
        size_t oldAllocatedUpTo = allocatedUpTo;
        for(; workerCount < THREAD_COUNT && allocatedUpTo < boxes.length; workerCount++) {
            workerInfo[workerCount].boxes = boxes.data;
            workerInfo[workerCount].boxesToCheck = min(boxes.length - allocatedUpTo, CHUNK_SIZE);
            workerInfo[workerCount].boxOffset = allocatedUpTo;
            workerInfo[workerCount].done = false;
            workerInfo[workerCount].workerId = workerCount;
            workerInfo[workerCount].verticalLines = &verticalLines;
            workerInfo[workerCount].horizontalLines = &horizontalLines;
            allocatedUpTo += workerInfo[workerCount].boxesToCheck;
        }
        printf("Sending out workers for boxes %zu to %zu...\n",oldAllocatedUpTo, allocatedUpTo);

        for(size_t i = 0; i < workerCount; i++) {
            int err = pthread_create(&threads[i], NULL, workerFn, &workerInfo[i]);
            assert(err == 0, "Failed to allocate thread! Err: %d\n", err);
        }

        while (true) {
            sleep(1);
            printf(".");
            fflush(stdout);
            bool allDone = true;
            for(size_t i = 0; i < workerCount; i++) if (!workerInfo[i].done) { allDone = false; break; }

            if (allDone) {
                for(size_t i = 0; i < workerCount; i++) {
                    pthread_join(threads[i], NULL);
                    if (workerResultOut[i] != -1) {
                        if (result == -1) result = workerResultOut[i];
                        else result = min(result, workerResultOut[i]);
                    }
                }
                printf("\nGathered threads...\n");
                if (result >= 0) printf("Result found at index %ld\n", result);
                else printf("No results yet...\n");
                break;
            }
        }
        if (result >= 0) break;
    }
    if (result < 0) {
        printf("Checked all boxes, no results found... :(\n");
    } else {
        printf("Maximum valid area found at index %ld: %zu\n", result, d_at(boxes, result).area);
    }

    return 0;
}
