#!/bin/bash

npx truffle exec scripts/soups/setNumbers.js
npx truffle exec scripts/soups/mint_12.js

npx truffle exec scripts/mondrian/setNumbers.js
npx truffle exec scripts/mondrian/toggleSale.js
npx truffle exec scripts/mondrian/toggleMax.js
npx truffle exec scripts/mondrian/toggleSoupHodlersMode.js
npx truffle exec scripts/mondrian/mint_9.js


npx truffle exec scripts/bb/setNumbers.js
npx truffle exec scripts/bb/toggleMinting.js
npx truffle exec scripts/bb/toggleEarlyAccessMode.js
npx truffle exec scripts/bb/mint_3.js


npx truffle exec scripts/soups/getNumbers.js 
npx truffle exec scripts/mondrian/getNumbers.js
npx truffle exec scripts/bb/getNumbers.js
