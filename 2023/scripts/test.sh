#! /bin/sh

dayToTest="$1"

if [ $dayToTest -lt '10' ]
then
    dayToTest="0${dayToTest#0}"
fi

npx jest --watch ''"$dayToTest/"'.*'
