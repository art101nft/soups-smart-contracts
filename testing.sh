#!/bin/bash

export NETWORK=rinkeby

npx truffle exec scripts/soups/setNumbers.js --network $NETWORK
npx truffle exec scripts/soups/mint_12.js --network $NETWORK

npx truffle exec scripts/mondrian/setNumbers.js --network $NETWORK
npx truffle exec scripts/mondrian/toggleSale.js --network $NETWORK
npx truffle exec scripts/mondrian/toggleMax.js --network $NETWORK
npx truffle exec scripts/mondrian/toggleSoupHodlersMode.js --network $NETWORK
npx truffle exec scripts/mondrian/mint_9.js --network $NETWORK


npx truffle exec scripts/bb/setNumbers.js --network $NETWORK
npx truffle exec scripts/bb/toggleMinting.js --network $NETWORK
npx truffle exec scripts/bb/toggleEarlyAccessMode.js --network $NETWORK
npx truffle exec scripts/bb/mint_3.js --network $NETWORK


npx truffle exec scripts/soups/getNumbers.js --network $NETWORK
npx truffle exec scripts/mondrian/getNumbers.js --network $NETWORK
npx truffle exec scripts/bb/getNumbers.js --network $NETWORK
