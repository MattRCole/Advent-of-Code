#define fail(...) do { printf(__VA_ARGS__); exit(1); } while (0)
#define assert(condition, ...) do { if (!(condition)) fail(__VA_ARGS__); } while (0)
