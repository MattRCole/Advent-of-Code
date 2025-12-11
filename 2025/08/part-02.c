#include <string.h>
#include <stdio.h>
#include <math.h>
#include "../util.h"

#define INPUT_PATH "./08/input.txt"
// #define INPUT_PATH "./08/example.txt"

typedef struct {
    ssize_t x;
    ssize_t y;
    ssize_t z;
} Vec3;

typedef struct {
    size_t vecAIdx;
    size_t vecBIdx;
    double distance;
} DistancePair;

dynamic_array(Circuit, size_t);
dynamic_array(JunctionBoxList, Vec3);
dynamic_array(DistancePairList, DistancePair);
dynamic_array(CircuitList, Circuit);

int main() {
    FILE *input = fopen(INPUT_PATH, "r");
    char *line = NULL;
    size_t lineCapp = 0;
    ssize_t rawLineLen;
    size_t lineNo = 0;
    JunctionBoxList junctionBoxes = new_dynamic_arr(0, 0, Vec3, NULL);
    DistancePairList distancePairs = new_dynamic_arr(0, 0, DistancePair, NULL);

    while((rawLineLen = getline(&line, &lineCapp, input)) > 0) {
        lineNo++;
        size_t lineLen = line[rawLineLen - 1] != '\n' ? rawLineLen : rawLineLen - 1;
        // printf("%03zu (count: %05zd, modified: %05zu): %s", lineNo, rawLineLen, lineLen, line);
        // if (line[rawLineLen - 1] != '\n') printf("\n");
        size_t x, y, z;
        x = y = z = 0;
        // it's this or deal with weird strncpy stuff. Whatever.
        for(ssize_t i = lineLen - 1; i >= 0; i--) {
            size_t pow10 = 0;
            while(line[i] != ',') {
                z += getNumericFromAscii(line[i]) * powTenLL(pow10);
                i--;
                pow10++;
            }
            i--;
            pow10 = 0;
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
        add_dynamic_item(junctionBoxes, ((Vec3){.x=x, .y=y, .z=z}));
        // printf("Added vector. x=%zu, y=%zu, z=%zu\n", dynamic_last(junctionBoxes).x,  dynamic_last(junctionBoxes).y, dynamic_last(junctionBoxes).z);
    }
    size_t colLen = junctionBoxes.length;
    size_t *junctionBoxToCircuitMap = calloc(junctionBoxes.length, sizeof(size_t));

    // double *distances = calloc(colLen * colLen, sizeof(double));
    // size_t *distances = calloc(colLen * colLen, sizeof(size_t));
    for(size_t i = 0; i < colLen; i++) {
        Vec3 ptA = {0};
        ptA.x = junctionBoxes.data[i].x;
        ptA.y = junctionBoxes.data[i].y;
        ptA.z = junctionBoxes.data[i].z;
        for(size_t j = 0; j < i; j++) {
            if (i == j) continue;
            Vec3 ptB = {0};
            ptB.x = junctionBoxes.data[j].x;
            ptB.y = junctionBoxes.data[j].y;
            ptB.z = junctionBoxes.data[j].z;
            double distance = sqrt(
                pow((double)(ptA.x - ptB.x), 2.0)
                + pow((double)(ptA.y - ptB.y), 2.0)
                + pow((double)(ptA.z - ptB.z), 2.0)
            );
            // size_t simple_distance = powLL(ptA.x - ptB.x)
            // distances[two_d_index(colLen, i, j)] = distance;
            // distances[two_d_index(colLen, j, i)] = distance;
            if (distancePairs.length) {
                size_t idx = 0;
                bool found = false;
                dynamic_bin_search(distancePairs, (distance == distancePairs.data[idx].distance), (distance < distancePairs.data[idx].distance), found, idx);

                // printf("final index is: %zu. List distance: %.2f, current distance: %.2f\n", idx, distancePairs.data[idx].distance, distance);
                if (distancePairs.data[idx].distance < distance) idx++;
                if (idx >= distancePairs.length) add_dynamic_item(distancePairs, ((DistancePair){.vecAIdx=i, .vecBIdx=j, .distance=distance}));
                else add_dynamic_item_at(distancePairs, ((DistancePair){.vecAIdx=i, .vecBIdx=j, .distance=distance}), idx);
                // printf("Distances so far: ");
                // for(size_t didx = 0; didx < distancePairs.length; didx++) {
                //     printf("%.2f ", distancePairs.data[didx].distance);
                // }
                // printf("\n");
            } else {
                add_dynamic_item(distancePairs, ((DistancePair){.vecAIdx=i, .vecBIdx=j, .distance=distance}));
            }
            // printf("%07.2f ", distance);
        }
        // printf("\n");
    }
    // assert(distancePairs.length >= JUNCTIONS_TO_CONNECT, "Did not parse enough junction boxes! Junction boxes: %zu, to connect: %d\n", junctionBoxes.length, JUNCTIONS_TO_CONNECT);
    size_t circuitCount = 0;
    
    CircuitList circuits = new_dynamic_arr(0, 0, Circuit, NULL);
    // add the "null" circuit:
    add_dynamic_item(circuits, ((Circuit)new_dynamic_arr(0, 0, size_t, NULL)));

    ssize_t finalVecA, finalVecB;
    finalVecA = finalVecB = -1;

    for(size_t i = 0; i < distancePairs.length; i++) {
        if ((i+ 1) %100  == 0) printf("\r%010zu/%010zu", i+1, distancePairs.length);
        if (i > 0 ) assert(distancePairs.data[i - 1].distance <= distancePairs.data[i].distance, "Out of order distances at index %zu: %.2f should be < %.2f\n", i, distancePairs.data[i-1].distance, distancePairs.data[i].distance);
        DistancePair currentPair = {
            .vecAIdx=distancePairs.data[i].vecAIdx,
            .vecBIdx=distancePairs.data[i].vecBIdx,
            .distance=distancePairs.data[i].distance
        };
        size_t circuitAIdx, circuitBIdx;
        circuitAIdx = junctionBoxToCircuitMap[currentPair.vecAIdx];
        circuitBIdx = junctionBoxToCircuitMap[currentPair.vecBIdx];
        if (circuitAIdx == 0 && circuitBIdx == 0) {
            circuitCount++;
            add_dynamic_item(circuits, ((Circuit)new_dynamic_arr(2, 0, size_t, NULL)));
            add_dynamic_item(dynamic_last(circuits), currentPair.vecAIdx);
            add_dynamic_item(dynamic_last(circuits), currentPair.vecBIdx);
            junctionBoxToCircuitMap[currentPair.vecAIdx] = circuitCount;
            junctionBoxToCircuitMap[currentPair.vecBIdx] = circuitCount;
            continue;
        }

        if (circuitAIdx == circuitBIdx) continue;
        
        if (circuitAIdx == 0 || circuitBIdx == 0) {
            size_t vecIdx = circuitAIdx == 0 ? currentPair.vecAIdx : currentPair.vecBIdx;
            size_t circuitIdx = max(circuitAIdx, circuitBIdx);
            add_dynamic_item(circuits.data[circuitIdx], vecIdx);
            junctionBoxToCircuitMap[vecIdx] = circuitIdx;
            if (circuits.data[circuitIdx].length == junctionBoxes.length) {
                finalVecA = currentPair.vecAIdx;
                finalVecB = currentPair.vecBIdx;
                break;
            }
            continue;
        }


        size_t keepCircuitIdx = min(circuitAIdx, circuitBIdx);
        // lol
        size_t deleteCircuitIdx = circuitAIdx ^ circuitBIdx ^ keepCircuitIdx;

        for(size_t j = 0; j < circuits.data[deleteCircuitIdx].length; j++) {
            size_t vecIdx = circuits.data[deleteCircuitIdx].data[j];
            junctionBoxToCircuitMap[vecIdx] = keepCircuitIdx;
            add_dynamic_item(circuits.data[keepCircuitIdx], vecIdx);
        }
        if (circuits.data[keepCircuitIdx].length == junctionBoxes.length) {
            finalVecA = currentPair.vecAIdx;
            finalVecB = currentPair.vecBIdx;
            break;
        }
        dynamic_free_all(circuits.data[deleteCircuitIdx]);
    }
    assert(finalVecA > 0 && finalVecB > 0, "DIDN't COMPLETE A FULL CIRCUIT!!!!\n");
    printf("\nvecA: %zu,%zu,%zu; vecB: %zu,%zu,%zu\n",
        junctionBoxes.data[finalVecA].x, junctionBoxes.data[finalVecA].y, junctionBoxes.data[finalVecA].z,
        junctionBoxes.data[finalVecB].x, junctionBoxes.data[finalVecB].y, junctionBoxes.data[finalVecB].z
    );

    printf("Result = %zu\n", junctionBoxes.data[finalVecA].x * junctionBoxes.data[finalVecB].x);
    // size_t totalUsedJunctions = 0;
    // These are multiplied together, I think we can assume that they're not going to be zero
    // size_t largestCircuits[3] = {1, 1, 1};
    // for(size_t i = 0; i < circuits.length; i++) {
    //     printf("Circuit # %zu:\n", i);

    //     if (circuits.data[i].length == 0) {
    //         printf("\tnone\n");
    //         continue;
    //     }
    //     printf("\t");
    //     for(size_t j = 0; j < circuits.data[i].length; j++) {
    //         if (j == 0) printf("%zu", circuits.data[i].data[j]);
    //         else printf(", %zu", circuits.data[i].data[j]);
    //     }
    //     printf("\n");

    //     size_t length = circuits.data[i].length;
    //     totalUsedJunctions += length;
    //     for(size_t j = 0; j < 3; j++) {
    //         if (largestCircuits[j] < length) {
    //             length ^= largestCircuits[j];
    //             largestCircuits[j] ^= length;
    //             length ^= largestCircuits[j];
    //             if (length == 1) break;
    //         }
    //     }
    // }

    // size_t total = 1;
    // for(size_t i = 0; i < 3; i++) total *= largestCircuits[i];

    // printf("Largest numbers = %zu, %zu and %zu\n", largestCircuits[0], largestCircuits[1], largestCircuits[2]);

    // printf("Total is: %zu\n", total);

    // for(size_t i = 0; i < colLen; i++) {
    //     for(size_t j = 0; j < colLen; j++) {
    //         printf("%07.2f ", distances[two_d_index(colLen, i, j)]);
    //     }
    //     printf("\n");
    // }

    return 0;
}
