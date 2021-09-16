// test/Mondrian.test.js
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const NonFungibleSoup = artifacts.require('NonFungibleSoup');
const Mondrian = artifacts.require('Mondrian');

// Start test block
contract('Mondrian', function ([owner, other]) {

  const unsetPrime = new BN('5867');
  const exampleURI = 'ipfs://myipfshash/';
  const examplePrime = new BN('911');

  beforeEach(async function () {
    this.nfs = await NonFungibleSoup.new({from: owner})
    this.mnd = await Mondrian.new(this.nfs.address, {from: owner});
  });

  // default checks

  it('sales are paused upon launch', async function () {
    await expect(
      await this.mnd.salesActive()
    ).to.equal(false);
  });

  it('soup hodlers mode is enabled upon launch', async function () {
    await expect(
      await this.mnd.soupHodlersMode()
    ).to.equal(true);
  });

  it('item maxes and accounting enforcement upon launch', async function () {
    await expect(
      await this.mnd.maxItemsEnforced()
    ).to.equal(true);
  });

  // ownership checks

  it('non owner cannot toggle contract boolean states', async function () {
    await expectRevert(
      this.mnd.toggleSale({from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.mnd.toggleSHM({from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.mnd.toggleMaxEnforced({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot set the random prime number, or base URI', async function () {
    await expectRevert(
      this.mnd.setRandPrime(911, {from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.mnd.setBaseURI("ipfs://mynewhash", {from: other}),
      'Ownable: caller is not the owner',
    );
  });

  // toggle func checks

  it('toggleSale function changes salesActive bool', async function () {
    await expect(
      await this.mnd.salesActive()
    ).to.equal(false);
    await this.mnd.toggleSale();
    await expect(
      await this.mnd.salesActive()
    ).to.equal(true);
    await this.mnd.toggleSale();
    await expect(
      await this.mnd.salesActive()
    ).to.equal(false);
  });

  it('toggleMaxEnforced function changes maxItemsEnforced bool', async function () {
    await expect(
      await this.mnd.maxItemsEnforced()
    ).to.equal(true);
    await this.mnd.toggleMaxEnforced();
    await expect(
      await this.mnd.maxItemsEnforced()
    ).to.equal(false);
    await this.mnd.toggleMaxEnforced();
    await expect(
      await this.mnd.maxItemsEnforced()
    ).to.equal(true);
  });

  it('toggleSHM function changes soupHodlersMode bool', async function () {
    await expect(
      await this.mnd.soupHodlersMode()
    ).to.equal(true);
    await this.mnd.toggleSHM();
    await expect(
      await this.mnd.soupHodlersMode()
    ).to.equal(false);
    await this.mnd.toggleSHM();
    await expect(
      await this.mnd.soupHodlersMode()
    ).to.equal(true);
  });

  // setRandPrime func checks

  it('setRandPrime function will set RAND_PRIME variable', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await expect(
      await this.mnd.RAND_PRIME()
    ).to.be.bignumber.equal(examplePrime);
  });

  it('setRandPrime function will only allow being set one time', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.setRandPrime(unsetPrime);
    await expect(
      await this.mnd.RAND_PRIME()
    ).to.be.bignumber.equal(examplePrime);
  });

  // setBaseURI func checks

  it('setBaseURI function will set new metadata URI for NFTs', async function () {
    await this.mnd.setBaseURI(exampleURI);
    await expect(
      await this.mnd.tokenURI(1)
    ).to.equal(exampleURI + '1');
    await expect(
      await this.mnd.tokenURI(2048)
    ).to.equal(exampleURI + '2048');
  });

  // checkTokenIsMinted func checks

  it('checkTokenIsMinted function will return false for unminted token Ids', async function () {
    await expect(
      await this.mnd.checkTokenIsMinted(1)
    ).to.equal(false);
  });

  it('checkTokenIsMinted function will return true for minted token Ids', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSHM();
    await this.mnd.toggleSale();
    await this.mnd.mintItem(1, [], {value: 0});
    let tokenId = await this.mnd.getTokenId(1);
    await expect(
      await this.mnd.checkTokenIsMinted(tokenId)
    ).to.equal(true);
  });

  it('checkTokenIsMinted function will revert if provided Id is outside of expected range', async function () {
    await expectRevert(
      this.mnd.checkTokenIsMinted(4097),
      'Provided tokenId is not allowed'
    );
    await expectRevert(
      this.mnd.checkTokenIsMinted(6000),
      'Provided tokenId is not allowed'
    );
  });

  // checkIndexIsMinted func checks

  it('checkIndexIsMinted function will return false for unminted token indexes', async function () {
    await expect(
      await this.mnd.checkIndexIsMinted(1)
    ).to.equal(false);
  });

  it('checkIndexIsMinted function will return true for minted token indexes', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSHM();
    await this.mnd.toggleSale();
    await this.mnd.mintItem(1, [], {value: 0});
    await expect(
      await this.mnd.checkIndexIsMinted(1)
    ).to.equal(true);
  });

  it('checkIndexIsMinted function will revert if provided index is outside of expected range', async function () {
    await expectRevert(
      this.mnd.checkIndexIsMinted(4097),
      'Provided token index is not allowed'
    );
  });

  // checkSoupTokenIsClaimed func checks
  it('checkSoupTokenIsClaimed func will return true if a given soup has been claimed for a mondrian', async function () {
    // Mint a soup
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.mintItem(1, {value: 0});
    const tokenId = await this.nfs.tokenOfOwnerByIndex(owner, 0);
    // Mint a mondrian and claim the soup
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSale();
    await this.mnd.mintItem(1, [tokenId], {value: 0});
    await expect(
      await this.mnd.checkSoupTokenIsClaimed(tokenId)
    ).to.equal(true);
  })

  // mintItem func checks

  it('mintItem func will revert if tokenIds list is empty while in soupHodlersMode', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSale();
    await expectRevert(
      this.mnd.mintItem(1, [], {value: 0}),
      'Must provide at least 1 token id'
    );
  });

  it('mintItem func will revert if RAND_PRIME not set', async function () {
    await this.mnd.toggleSHM();
    await this.mnd.toggleSale();
    await expectRevert(
      this.mnd.mintItem(1, [], {value: 0}),
      'Random prime number has not been defined.'
    );
  });

  it('mintItem func will revert if salesActive is false', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSHM();
    await expect(
      await this.mnd.salesActive()
    ).to.equal(false);
    await expectRevert(
      this.mnd.mintItem(1, [], {value: 0}),
      'Sale must be active'
    );
  });

  it('mintItem func will revert if numberOfTokens arg exceeds max per address', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSHM();
    await this.mnd.toggleSale();
    await expectRevert(
      this.mnd.mintItem(4, [], {value: 0}),
      'Minting would exceed allowance set in contract since the max is being enforced'
    );
  });

  it('mintItem func will revert if minting would exceed soup balance per address when in soupHodlersMode', async function () {
    // Mint 6 Soups
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.mintItem(3, {value: 0});
    await this.nfs.mintItem(3, {value: 0});
    await this.nfs.mintItem(3, {value: 0, from: other});
    const mintFive = await this.nfs.tokenOfOwnerByIndex(owner, 4);
    const mintSix = await this.nfs.tokenOfOwnerByIndex(owner, 5);


    // Begin Mondrians - only mint 5 out of 6
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSale();
    for (i = 0; i < 5; i++) {
      let tokenId = await this.nfs.tokenOfOwnerByIndex(owner, i);
      console.log(`Minting 1 mondrian using soup token Id ${tokenId}`);
      let res = await this.mnd.mintItem(1, [tokenId], {value: 0});
      await expectEvent(
        res, 'Transfer'
      );
    }
    await expect(
      (await this.mnd.balanceOf(owner)).toString()
    ).to.equal('5');
    console.log('should have 5 mondrians at this point');
    // Requesting 2 more would go over max (7 instead of 6) and should fail - with both items
    await expectRevert(
      this.mnd.mintItem(2, [mintSix, mintFive], {value: 0}),
      'Minting would exceed allowance set in contract based upon your balance of Soups (NFS)'
    );
    // Requesting 2 more would go over max (7 instead of 6) and should fail - with one soup but 2 requested
    await expectRevert(
      this.mnd.mintItem(2, [mintSix], {value: 0}),
      'Number of tokens requested must be equal to number of soup token Ids provided'
    );
    let res = await this.mnd.mintItem(1, [mintSix], {value: 0});
    await expectEvent(
      res, 'Transfer'
    );
    await expect(
      (await this.mnd.balanceOf(owner)).toString()
    ).to.equal('6');
  });

  it('mintItem func will revert if minting would exceed 3 max per address when not in soupHodlersMode and enforcement on (default)', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSHM();
    await this.mnd.toggleSale();
    await this.mnd.mintItem(2, [], {value: 0});
    await expectRevert(
      this.mnd.mintItem(2, [], {value: 0}),
      'Minting would exceed allowance set in contract since the max is being enforced'
    );
  });

  it('mintItem func lets you mint any when maxItemsEnforced is toggled off (false)', async function () {
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSHM();
    await this.mnd.toggleSale();
    await this.mnd.toggleMaxEnforced();
    let res1 = await this.mnd.mintItem(3, [], {value: 0});
    await expectEvent(
      res1, 'Transfer'
    );
    let res2 = await this.mnd.mintItem(3, [], {value: 0});
    await expectEvent(
      res2, 'Transfer'
    );
    let res3 = await this.mnd.mintItem(3, [], {value: 0});
    await expectEvent(
      res3, 'Transfer'
    );
    await expect(
      (await this.mnd.balanceOf(owner)).toString()
    ).to.equal('9');
  });

  it('mintItem func will revert if the soup token has been used before', async function () {
    console.log('Mint 1 soup to owner address');
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.mintItem(1, {value: 0});
    console.log('Fire up Mondrians');
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSale();
    console.log('Mint 1 Mondrian as existing soup hodler');
    let tokenId = await this.nfs.tokenOfOwnerByIndex(owner, 0);
    await this.mnd.mintItem(1, [tokenId], {value: 0});
    console.log('Transfer minted soup used to redeem Mondrian to other');
    await this.nfs.transferFrom(owner, other, tokenId);
    console.log('Mint 1 Mondrian with already redeemed soup hodl as other - should fail');
    await expectRevert(
      this.mnd.mintItem(1, [tokenId], {value: 0, from: other}),
      'Token already associated with another sender'
    );
  });

  it('mintItem func will revert if sender does not own all provided tokens', async function () {
    console.log('Mint 1 soup to owner address');
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.mintItem(1, {value: 0});
    console.log('Fire up Mondrians');
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSale();
    console.log('Mint 1 Mondrian as a fake hodler - should fail');
    let tokenId = await this.nfs.tokenOfOwnerByIndex(owner, 0);
    await expectRevert(
      this.mnd.mintItem(1, [tokenId], {value: 0, from: other}),
      'Sender is not the owner of provided soup'
    );
  });

  it('mintItem func will mint only up to 2048 items with soupHodlersMode enabled', async function () {
    this.timeout(0); // dont timeout for this long test

    // Mint all the NFS tokens
    console.log(`Mint all the NFS tokens to test owner account`);
    await this.nfs.setRandPrime(examplePrime);
    for (i = 0; i < 1024; i++) {
      let res = await this.nfs.mintItem(2, {value: 0});
      await expectEvent(
        res, 'Transfer'
      );
    }

    // Begin minting the MND tokens referencing NFS tokens
    console.log(`Minting as many Mondrians as Soups (2048).`);
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleSale();
    await this.mnd.toggleMaxEnforced();
    for (i = 0; i < 2048; i++) {
      let tokenId = await this.nfs.tokenOfOwnerByIndex(owner, i);
      let res = await this.mnd.mintItem(1, [tokenId], {value: 0});
      await expectEvent(
        res, 'Transfer'
      );
    }

    // We should have 2048 Mondrians at this point but
    // we're unable to proceed until disabling SHM.
    console.log(`Expecting 2048 Mondrians minted by only Soup hodlers`);
    await expect(
      (await this.mnd.totalSupply()).toString()
    ).to.equal('2048');
    let tokenId = await this.nfs.tokenOfOwnerByIndex(owner, 2000);

    // Hodlers cant mint more Mondrians than Soups during SHM
    console.log(`Hodlers cant mint more Mondrians than Soups during soupHodlersMode`);
    await expectRevert(
      this.mnd.mintItem(1, [tokenId], {value: 0}),
      'Cannot mint more Mondrians than Soups that exist'
    );

    // Disable SHM
    console.log(`Toggling soupHodlersMode`);
    await this.mnd.toggleSHM();

    // Resume minting mondrians uninhibited as new user
    console.log(`Minting all Mondrians`);
    for (i = 0; i < 1024; i++) {
      let res = await this.mnd.mintItem(2, [] , {value: 0, from: other});
      await expectEvent(
        res, 'Transfer'
      );
    }

    console.log(`Expecting 4096 Mondrians minted`);
    await expect(
      (await this.mnd.totalSupply()).toString()
    ).to.equal('4096');

    // Try to mint past upper boundaries
    console.log('Ensure it wont exceed max supply');
    await expectRevert(
      this.mnd.mintItem(1, [], {value: 0}),
      'Minting would exceed max supply'
    );
  });

  it('mintItem func will still mint all Mondrians if soupHodlersMode disabled early', async function () {
    this.timeout(0); // dont timeout for this long test

    // Mint all the NFS tokens
    console.log(`Mint all the NFS tokens to test owner account`);
    await this.nfs.setRandPrime(examplePrime);
    for (i = 0; i < 1024; i++) {
      let res = await this.nfs.mintItem(2, {value: 0});
      await expectEvent(
        res, 'Transfer'
      );
    }

    // Begin minting the MND tokens referencing NFS tokens
    console.log(`Minting half as many Mondrians as Soups (1024).`);
    await this.mnd.setRandPrime(examplePrime);
    await this.mnd.toggleMaxEnforced();
    await this.mnd.toggleSale();
    for (i = 0; i < 1024; i++) {
      let tokenId = await this.nfs.tokenOfOwnerByIndex(owner, i);
      let res = await this.mnd.mintItem(1, [tokenId], {value: 0});
      await expectEvent(
        res, 'Transfer'
      );
    }

    // We should have 1024 Mondrians at this point but say they've stopped
    // minting and now we need to allow the public to mint early
    console.log(`Expecting 1024 Mondrians minted by only Soup hodlers`);
    await expect(
      (await this.mnd.totalSupply()).toString()
    ).to.equal('1024');

    // Disable SHM
    console.log(`Toggling soupHodlersMode`);
    await this.mnd.toggleSHM();

    // Resume minting mondrians uninhibited as new user
    console.log(`Minting all remaining Mondrians (3072)`);
    for (i = 0; i < 1024; i++) {
      let res = await this.mnd.mintItem(3, [] , {value: 0, from: other});
      await expectEvent(
        res, 'Transfer'
      );
    }

    console.log(`Expecting 4096 Mondrians minted`);
    await expect(
      (await this.mnd.totalSupply()).toString()
    ).to.equal('4096');

    // Try to mint past upper boundaries
    console.log('Ensure it wont exceed max supply');
    await expectRevert(
      this.mnd.mintItem(1, [], {value: 0}),
      'Minting would exceed max supply'
    );
  });

});
