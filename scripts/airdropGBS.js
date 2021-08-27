let goodBoiOwners = []; // manually override me
let soupTokenIds = [];

module.exports = async function main(callback) {
  try {
    const NonFungibleSoup = artifacts.require("NonFungibleSoup");
    const nfs = await NonFungibleSoup.deployed();
    let accounts = await web3.eth.getAccounts();
    let supply = await nfs.totalSupply();
    let bal = await nfs.balanceOf(accounts[0]);
    console.log(`Found ${bal} NFTs for address ${accounts[0]}`)

    // Ensure we have enough soup can NFTs to send
    if (goodBoiOwners.length > bal) {
      console.log(`Not enough NFTs available (${bal}) to send to all Good Boi owners ${goodBoiOwners.length}`)
      callback(1);
    }

    // Get all tokenIds that belong to contract owner
    for (i = 1; i <= supply; i++) {
      tokenId = await nfs.getTokenId(i);
      owner = await nfs.ownerOf(tokenId);
      if (owner == accounts[0]) {
        soupTokenIds.push(Number(tokenId))
      }
    }

    // Loop through Good Boi owners and airdrop them a soup can NFT
    for (i = 0; i < goodBoiOwners.length; i++) {
      let gbOwner = goodBoiOwners[i];
      let tokenId = soupTokenIds[i];
      console.log(`Sending soup #${tokenId} to Good Boi owner ${gbOwner}...`)
        let res = await nfs.safeTransferFrom(accounts[0], gbOwner, tokenId);
        console.log(res.tx);
    }

    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
