#! /bin/sh

dayToMake="$1"

if [ -z "$2" ]
then
    partToMake="01"
else
    partToMake="0${2#0}"
fi

if [ $dayToMake -lt '10' ]
then
    dayToMake="0${dayToMake#0}"
fi

filePath="./${dayToMake}/script-${partToMake}.js"
inputPath="./${dayToMake}/input.txt"
examplePath="./${dayToMake}/example.txt"

mkdir -p "./$dayToMake"

if [ ! -f "$inputPath" ]
then
    touch "$inputPath"
fi

if [ ! -f "$examplePath" ]
then
    touch "$examplePath"
fi

if [ -f "$filePath" ]
then
    echo "The file $filePath already exists, will not overwrite"
    exit 1
fi

printf 'const fs = require("node:fs")\n\nconst file = fs.readFileSync("%s", { encoding: "utf-8" })\n\n' "$inputPath" > "$filePath"
