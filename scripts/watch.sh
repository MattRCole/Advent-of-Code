#! /bin/sh

dayToRun="$1"
partToRun="$2"


if [ "$#" -eq 0 ] || [ "$dayToRun" = "--help" ] || [ "$dayToRun" = "-help" ] || [ "$dayToRun" = '-h' ]
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
  partToRun="01"
else
  partToRun="0${partToRun#0}"
fi

if [ $dayToRun -lt '10' ]
then
    dayToRun="0${dayToRun#0}"
fi

sh -c "deno fmt --watch >/dev/null 2>&1" &

deno run -A --watch "./${dayToRun}/script-${partToRun}.ts"