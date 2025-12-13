#pragma once
#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>
#include <stdlib.h>

#define fail(...) do { printf(__VA_ARGS__); exit(1); } while (0)
#define assert(condition, ...) do { if (!(condition)) fail(__VA_ARGS__); } while (0)
#define max(a, b) ((a) > (b) ? (a) : (b))
#define min(a, b) ((a) > (b) ? (b) : (a))
#define two_d_index(col_len, x, y) (((y) * (col_len)) + (x))
#define clamp(minimum, target, maximum) max((minimum), min((target), (maximum)))

#define DYNAMIC_ARRAY_DEFAULT_SIZE 20
#define dynamic_array(type_name, ptr) typedef struct type_name { size_t size; size_t length; size_t dataSize; ptr *data; } type_name
#define _expand_array(dynamic_arr) do { \
    if ((dynamic_arr).size == 0 || (dynamic_arr).data == NULL) { \
        (dynamic_arr).size = (dynamic_arr).size ? (dynamic_arr).size : DYNAMIC_ARRAY_DEFAULT_SIZE; \
        (dynamic_arr).data = malloc((dynamic_arr).dataSize * (dynamic_arr).size); \
        break; \
    } \
    void *newData = malloc((dynamic_arr).dataSize * (dynamic_arr).size * 2); \
    memcpy(newData, (dynamic_arr).data, (dynamic_arr).dataSize * (dynamic_arr).length); \
    free((dynamic_arr).data); \
    (dynamic_arr).data = newData; \
    (dynamic_arr).size = (dynamic_arr).size * 2; \
} while (0)

#define add_dynamic_item(dynamic_arr, item) do { \
    if ((dynamic_arr).length >= (dynamic_arr).size || (dynamic_arr).data == NULL) { _expand_array((dynamic_arr)); } \
    (dynamic_arr).data[(dynamic_arr).length] = item; \
    (dynamic_arr).length += 1; \
} while (0)

#define dynamic_first(dynamic_arr) (dynamic_arr).data[0]
#define dynamic_last(dynamic_arr) (dynamic_arr).data[(dynamic_arr).length - 1]

#define remove_dynamic_item(dynamic_arr, at_index) do { \
    size_t _idx_ = (size_t)((at_index) < 0 ? (dynamic_arr).length - (at_index) : at_index); \
    assert(_idx_ < (dynamic_arr).length && _idx_ >= 0, "Cannot remove item at %ld as it's greater than %zu\n", (ssize_t)(at_index), (dynamic_arr).length); \
    (dynamic_arr).length--; \
    if (_idx_ == (dynamic_arr).length) { break; } \
    memmove((dynamic_arr).data + _idx_, (dynamic_arr).data + _idx_ + 1, ((dynamic_arr).length - _idx_) * (dynamic_arr).dataSize); \
} while (0)

// This is unsafe. Always assert that length > 0 before use
#define dynamic_pop(dynamic_arr) (dynamic_arr).data[(dynamic_arr).length--]

#define dynamic_erase_all(dynamic_arr) (dynamic_arr).length = 0
#define dynamic_free_all(dynamic_arr) do { free((dynamic_arr).data); (dynamic_arr).data = NULL; (dynamic_arr).size = 0; (dynamic_arr).length = 0; } while (0)

#define add_dynamic_item_at(dynamic_arr, item, at_index) do  { \
    size_t _idx__ = (size_t)((at_index) < 0 ? (dynamic_arr).length - (at_index) : (at_index)); \
    assert(_idx__ >= 0 && _idx__ <= (dynamic_arr).length, "Cannot insert item at %zu as it is > %zu", _idx__, (dynamic_arr).length); \
    if (_idx__ == ((dynamic_arr).length)) { \
        add_dynamic_item((dynamic_arr), (item)); \
        break; \
    } \
    if ((dynamic_arr).length >= (dynamic_arr).size || (dynamic_arr).data == NULL) _expand_array((dynamic_arr)); \
    memmove((dynamic_arr).data + _idx__ + 1, (dynamic_arr).data + _idx__, ((dynamic_arr).length - _idx__) * (dynamic_arr).dataSize); \
    (dynamic_arr).data[_idx__] = item; \
    (dynamic_arr).length++; \
} while (0)

#define dynamic_copy(src_arr, dest_arr) do { \
    if ((src_arr).length == 0) { \
        dest_arr.length = 0; \
        break; \
    } \
    if ((dest_arr).size < (src_arr).length) { \
        if ((dest_arr).data) { free((dest_arr).data); (dest_arr).data = NULL; } \
        (dest_arr).size = (src_arr).size; \
        _expand_array(dest_arr); \
    } \
    memcpy((dest_arr).data, (src_arr).data, (src_arr).length * (src_arr).dataSize); \
} while (0);

#define dynamic_extend(dest_arr, src_arr) do {\
    if ((src_arr).length == 0) break; \
    if ((dest_arr).size <  (dest_arr).length + (src_arr).length) { \
        (dest_arr).size = (((dest_arr).length + (src_arr).length) / 2) + 1; \
        _expand_array(dest_arr); \
    } \
    memcpy((dest_arr).data + (dest_arr).length, (src_arr).data, (src_arr).length * (src_arr).dataSize); \
    (dest_arr).length = (dest_arr).length + (src_arr).length; \
} while (0)

#define new_dynamic_arr(initial_size, initial_length, data_type, initial_pointer) { .size=(initial_size), .length=(initial_length), .dataSize=sizeof(data_type), .data=(initial_pointer) }
#define empty_dynamic_arr(data_type) new_dynamic_arr(0, 0, data_type, NULL)
#define d_at(dynamic_arr, idx) ((dynamic_arr).data[((ssize_t)(idx) < 0 ? (dynamic_arr).length + ((size_t)(idx)) : (idx))])

#define dynamic_bin_search(dynamic_arr, comparison_statement_eq, comparision_statement_lt, was_found, final_idx) do {\
    assert((dynamic_arr).length > 0, "Cannot search %s since it has a length of 0\n", #dynamic_arr); \
    size_t _left__, _right__; _left__ = 0; _right__ = (dynamic_arr).length; \
    (was_found) = false; \
    while (_left__ < _right__) { \
        (final_idx) = _left__ + ((_right__ - _left__) / 2); \
        if (comparison_statement_eq) { \
            (was_found) = true; \
            break; \
        } else if (comparision_statement_lt) { _right__ = (final_idx); } else { _left__ = (final_idx) + 1; } \
    } \
} while (0)

dynamic_array(String, char);

#define to_string(chars) (String)new_dynamic_arr(strlen(chars), strlen(chars), char, chars)

#define number_to_ascii(num) (char)(((num) % 10) + 0x30)

int64_t getPrimeFactors(size_t number, size_t *resultsOut, size_t *resultCountsOut, size_t maxResults);
size_t powLL(size_t base, size_t power);
size_t powTenLL(size_t power);
size_t isolatePowerRange10(size_t maxPowerOfTen, size_t minPowerOfTen, size_t number);
size_t isolatePowerRange(size_t base, size_t maxBasePower, size_t minBasePower, size_t number);
uint8_t getNumericFromAscii(char character);
bool isNumeric(char character);

extern size_t *primes;
extern size_t primeCount;