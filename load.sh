#!/bin/bash

rm -f ./js/alvi/base/index.js
rm -f ./js/alvi/children/index.js
rm -f ./js/main/index.js
rm -f ./js/algovisualizer-lib.js

cat ./js/alvi/base/*.js > ./js/alvi/base/index.js
cat ./js/alvi/children/*.js > ./js/alvi/children/index.js
cat ./js/main/*.js > ./js/main/index.js
cat ./js/entry.js ./js/alvi/base/index.js ./js/alvi/children/index.js ./js/main/index.js ./js/exit.js > ./js/algovisualizer-lib.js
