# soups-smart-contracts

This repo holds the Ethereum smart contracts for [Non-Fungible Soup](https://NonFungibleSoup.io).

As of now there is only [one contract](./contracts/NonFungibleSoup.sol) which is a simple ERC721 contract using OpenZeppelin's contract system.

## Setup

1. Install [MetaMask](https://metamask.io/) to your browser
2. Create a new MetaMask wallet and take note of the 12-word mnemonic seed
3. Install [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm) to your system
4. Use NVM to install NodeJS ~12: `nvm install 12.18 && nvm use 12.18`
5. Install NodeJS dependencies: `npm install`
6. Copy example secrets file: `cp env-example .env`
7. Update secrets (new mnemonic seed and Infura API token): `vim .env`

You can use MetaMask to generate a new wallet and grab the seed from there. Doing this makes it very easy to work with the contract since the `withdraw` function will send you all the collected ETH from the contract.

Now your repo is setup to deploy and interact with your contracts.

## Testing

For testing we're using Ganache to get a local blockchain and then utilizing Truffle with some OpenZeppelin helpers to run unit tests on the contract.

```
# In one Terminal window/tab/session
npx ganache-cli --defaultBalanceEther 50000

# In another
npx truffle test
```

There is a unit test in there that is very time consuming (the last one) since it mints all 2048 soups to confirm the upper lower bounds, that soups will not go over, and that we don't get 0 or > 2048 tokenIds; you may want to temporarily comment it out if casually updating or adding tests.

## Deploying

Truffle makes it easy! Please note, you will need some ETH in the wallet in order for the deployment to happen. On average it will cost ~0.003 ETH to deploy (at least on Rinkeby so far).

```
$ export NETWORK=rinkeby   # use mainnet for live network
$ npx truffle deploy --network $NETWORK
```

Truffle will do it's thing and spit out some details about the deployment. You need to take note of the `contract address` - you will use that in several places.

Truffle creates a folder called `build` where metadata is stored. You should back this folder up in case the contents were removed so you can still manage the contract as the owner.

## Frontend

At this point, you've got a deployed contract which will mint new Soups to those who invoke the `mintItem` function and pay for the gas required. How do you actually get someone to do this? You need some Javascript on a website to actually do that contract interaction.

Here's what you need to gather:
* Contract address (outputted in `truffle deploy` step above)
* Contract ABI (`cat build/contracts/NonFungibleSoup.json | jq .abi` - assumes you have `jq` installed to your system)

You need a website (HTML + CSS + JS) that makes use of web3 and MetaMask Javascript. You need to define the contract address, the ABI (as array), load web3 and MetaMask Javascript, and invoke the `mintItem` contract.

See [NonFungibleSoup.io](https://NonFungibleSoup.io/) site for an example (`js/main.js`).

The following Javascript code is the main piece here:

```
const contract = new w3.eth.Contract(abi, contractAddress, {from: walletAddress});
const res = await contract.methods.mintItem(1).send({from: walletAddress, value: 0})
```

This is where the magic happens!

When users in the frontend click your magic button (whatever class you wired up `onclick` events for), they will be onboarded with MetaMask install if they don't have it. If they do have it the Javascript will connect their MetaMask wallet to the site and proceed to prompt the user to invoke the `mintItem` contract function. Once they confirm, gas fees are sent, function invoked, and you'll see updates on Etherscan. When received, the ETH network will trigger the `payable` event and mint the NFT and transfer to the sender!

NFTs can then be seen in the user's OpenSea account!

## Interacting

After deploying you will need to interact with the contract....at least, you will if you want to withdraw the ETH!

### Console

The simplest way to interact is manually running commands in the Truffle console: `npx truffle console --network $NETWORK`

In the console you have to load your contract and can manually invoke functions...like this:

```
$ npx truffle console --network $NETWORK
truffle(rinkeby)> let nfs = await NonFungibleSoup.deployed();
undefined
truffle(rinkeby)> (await nfs.MAX_ITEMS()).toString()
'2048'
truffle(rinkeby)> nfs.tokenURI(5)
'ipfs://QmaWpBxEhSi1tRdjjhbGBq7evTDc5pGJfA6ryFuJ2Ai3St/5'
```

### Scripted

You can script contract interactions and use them in conjunction with Truffle. See the [scripts](./scripts) folder to see what's been created so far. If you review the code you'll notice it's the same as the console.

As of now we only have a script to withdraw the balance in the contract address to the creator (root address of the mnemonic seed you generated earlier):

```
$ npx truffle exec scripts/withdraw.js --network rinkeby
Using network 'rinkeby'.

Contract balance has been withdrawn to contract creator. Check your balance!
```

## Support

Make an issue in this repo if you have questions, or hit up `lza_menace` in the Patrn/GoodBoiSociety Discord.
