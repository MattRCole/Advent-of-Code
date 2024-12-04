#! /bin/sh

dayToTest="$1"
partToTest="$2"


if [ "$#" -eq 0 ] || [ "$dayToTest" = "--help" ] || [ "$dayToTest" = "-help" ] || [ "$dayToTest" = '-h' ]
then
  printf 'Advent of code runner helper. Usage: ./scripts/watch.sh [day] [part=1]\n'

  exit 0
fi

if [ "$#" -gt 2 ]
then
  printf 'Warning: Unknown arguments provided that will be ignored!\n'
fi

if [ "$#" -eq 1 ]
then
  partToTest="01"
else
  partToTest="0${partToTest#0}"
fi

if [ $dayToTest -lt '10' ]
then
    dayToTest="0${dayToTest#0}"
fi

deno test -A --watch "./${dayToTest}/script-${partToTest}.test.ts"