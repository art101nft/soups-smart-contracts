// test/NonFungibleSoup.test.js
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const NonFungibleSoup = artifacts.require('NonFungibleSoup');

// Start test block
contract('NonFungibleSoup', function ([owner, other]) {

  const unsetPrime = new BN('5867');
  const exampleURI = 'ipfs://myipfshash/';
  const examplePrime = new BN('911');

  beforeEach(async function () {
    this.nfs = await NonFungibleSoup.new({from: owner});
  });

  // confirm default checks

  it('sales are active upon launch', async function () {
    await expect(
      await this.nfs.saleIsActive()
    ).to.equal(true);
  });

  // ownership checks

  it('non owner cannot withdraw contract funds', async function () {
    await expectRevert(
      this.nfs.withdraw({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot pause and resume sales', async function () {
    await expectRevert(
      this.nfs.pauseSale({from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.nfs.resumeSale({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot set the random prime number or base URI', async function () {
    await expectRevert(
      this.nfs.setRandPrime(911, {from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.nfs.setBaseURI("ipfs://mynewhash", {from: other}),
      'Ownable: caller is not the owner',
    );
  });

  // pause/resumeSale func checks

  it('pauseSale function sets saleIsActive var to false', async function () {
    await this.nfs.pauseSale();
    await expect(
      await this.nfs.saleIsActive()
    ).to.equal(false);
  });

  it('resumeSale function sets saleIsActive var to false', async function () {
    await this.nfs.pauseSale();
    await this.nfs.resumeSale();
    await expect(
      await this.nfs.saleIsActive()
    ).to.equal(true);
  });

  // setRandPrime func checks

  it('setRandPrime function will set RAND_PRIME variable', async function () {
    await this.nfs.setRandPrime(examplePrime);
    await expect(
      await this.nfs.RAND_PRIME()
    ).to.be.bignumber.equal(examplePrime);
  });

  it('setRandPrime function will only allow being set one time', async function () {
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.setRandPrime(unsetPrime);
    await expect(
      await this.nfs.RAND_PRIME()
    ).to.be.bignumber.equal(examplePrime);
  });

  // setBaseURI func checks

  it('setBaseURI function will set new metadata URI for NFTs', async function () {
    await this.nfs.setBaseURI(exampleURI);
    await expect(
      await this.nfs.tokenURI(1)
    ).to.equal(exampleURI + '1');
    await expect(
      await this.nfs.tokenURI(2048)
    ).to.equal(exampleURI + '2048');
  });

  // checkTokenIsMinted func checks

  it('checkTokenIsMinted function will return false for unminted token Ids', async function () {
    await expect(
      await this.nfs.checkTokenIsMinted(1)
    ).to.equal(false);
  });

  it('checkTokenIsMinted function will return true for minted token Ids', async function () {
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.mintItem(1, {value: 0});
    let tokenId = await this.nfs.getTokenId(1);
    await expect(
      await this.nfs.checkTokenIsMinted(tokenId)
    ).to.equal(true);
  });

  it('checkTokenIsMinted function will revert if provided Id is outside of expected range', async function () {
    await expectRevert(
      this.nfs.checkTokenIsMinted(2049),
      'Provided tokenId is not allowed'
    );
  });

  // checkIndexIsMinted func checks

  it('checkIndexIsMinted function will return false for unminted token indexes', async function () {
    await expect(
      await this.nfs.checkIndexIsMinted(1)
    ).to.equal(false);
  });

  it('checkIndexIsMinted function will return true for minted token indexes', async function () {
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.mintItem(1, {value: 0});
    await expect(
      await this.nfs.checkIndexIsMinted(1)
    ).to.equal(true);
  });

  it('checkIndexIsMinted function will revert if provided index is outside of expected range', async function () {
    await expectRevert(
      this.nfs.checkIndexIsMinted(2049),
      'Provided token index is not allowed'
    );
  });

  // mintItem func checks

  it('mintItem function will revert if RAND_PRIME not set', async function () {
    await expectRevert(
      this.nfs.mintItem(1, {value: 0}),
      'Random prime number has not been defined in the contract'
    );
  });

  it('mintItem function will revert if saleIsActive is false', async function () {
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.pauseSale();
    await expect(
      await this.nfs.saleIsActive()
    ).to.equal(false);
    await expectRevert(
      this.nfs.mintItem(1, {value: 0}),
      'Sale must be active to mint items'
    );
  });

  it('mintItem function will revert if numberOfTokens arg exceeds max', async function () {
    await this.nfs.setRandPrime(examplePrime);
    await expectRevert(
      this.nfs.mintItem(4, {value: 0}),
      'Can only mint 3 items at a time'
    );
  });

  it('mintItem function will loop and mint appropriate amount of items', async function () {
    await this.nfs.setRandPrime(examplePrime);
    await this.nfs.mintItem(3, {value: 0})
    await expect(
      (await this.nfs.totalSupply()).toString()
    ).to.equal('3');
    await this.nfs.mintItem(3, {value: 0})
    await expect(
      (await this.nfs.totalSupply()).toString()
    ).to.equal('6');
    await this.nfs.mintItem(2, {value: 0})
    await expect(
      (await this.nfs.totalSupply()).toString()
    ).to.equal('8');
    await this.nfs.mintItem(1, {value: 0})
    await expect(
      (await this.nfs.totalSupply()).toString()
    ).to.equal('9');
  });

  it('mintItem function will mint only up to 2048 Items', async function () {
    this.timeout(0); // dont timeout for this long test
    await this.nfs.setRandPrime(examplePrime);
    for (i = 0; i < 1024; i++) {
      let res = await this.nfs.mintItem(2, {value: 0});
      let tokenIndex = (await this.nfs.totalSupply()).toString();
      let tokenId = (await this.nfs.getTokenId(tokenIndex)).toString();
      let timestamp = (await this.nfs.TIMESTAMP()).toString();
      // console.log(`Minted token index ${tokenIndex} at ${tokenId}! Timestamp: ${timestamp} - Prime: ${examplePrime}`);
      await expectEvent(
        res, 'Transfer'
      );
    }
    await expect(
      (await this.nfs.totalSupply()).toString()
    ).to.equal('2048');
    await expectRevert(
      this.nfs.mintItem(1, {value: 0}),
      'Purchase would exceed max supply'
    );
  });

});
