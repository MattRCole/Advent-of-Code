# 2025

Pretty simple set-up this year. Just use your favorite `C` compiler.

### Tooling

I'm using `clang` mostly and an absolute `h*ck` ton of macros.

to compile: Choose your day and compile it (and `utils.c`) with your favorite C compiler.

I have no idea what "compatibility" year I've been using.

### Running

Programs are hard-coded to be run from the `2025` folder.

### Watch Script

If you'd like to use the `watch` script, You'll need to install [`nomon.sh`](https://github.com/mattrcole/nomon) and [`fswatch`](https://github.com/emcrisostomo/fswatch).

It'll compile the solution for the given day/part and then run it.

it's usage is available by passing `-h` or `--help` or `help`.

TL;DR: `./watch.sh [day] [part]`. Example for day 1 part 2: `./watch.sh 1 2`
