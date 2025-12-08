#! /usr/bin/env bash

printHelp="false"
if [[ " --help " =~ " $@ " ]] ; then printHelp="true"; fi
if [[ " -h " =~ " $@ " ]] ; then printHelp="true"; fi
if [[ " help " =~ " $@ " ]] ; then printHelp="true"; fi

if [ "$printHelp" = "true" ]
then
    printf 'watch.sh usage:\n\t./watch.sh [day] [part-no] [--help]\n'
    exit 0
fi

dayToRun="$1"
partToRun="$2"

if [ "$partToRun" -lt '10' ]
then
  partToRun="0${partToRun#0}"
fi

if [ $dayToRun -lt '10' ]
then
    dayToRun="0${dayToRun#0}"
fi

dayPart="./$dayToRun/part-$partToRun"

nomon.sh -w "." -e c -e h -e txt -c -- 'clang "'"$dayPart"'.c" "./util.c" -o '"$dayPart"' && '"$dayPart"
