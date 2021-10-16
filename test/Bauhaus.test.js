// test/Mondrian.test.js
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const Bauhaus = artifacts.require('Bauhaus');
const Mondrian = artifacts.require('Mondrian');

// Start test block
contract('Bauhaus', function ([owner, other]) {

  const unsetPrime = new BN('5867');
  const exampleURI = 'ipfs://myipfshash/';
  const examplePrime = new BN('911');

  beforeEach(async function () {
    this.contract = await Bauhaus.new({from: owner})
  });

  // default checks

  it('minting is paused upon launch', async function () {
    await expect(
      await this.contract.mintingActive()
    ).to.equal(false);
  });

  it('earlyAccessMode is enabled upon launch', async function () {
    await expect(
      await this.contract.earlyAccessMode()
    ).to.equal(true);
  });

  // ownership checks

  it('non owner cannot toggle contract boolean states', async function () {
    await expectRevert(
      this.contract.toggleMinting({from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.contract.toggleEarlyAccessMode({from: other}),
      'Ownable: caller is not the owner',
    );
  });

  it('non owner cannot set the random prime number or base URI', async function () {
    await expectRevert(
      this.contract.setRandPrime(911, {from: other}),
      'Ownable: caller is not the owner',
    );
    await expectRevert(
      this.contract.setBaseURI("ipfs://mynewhash", {from: other}),
      'Ownable: caller is not the owner',
    );
  });

  // toggle func checks

  it('toggleMinting function changes mintingActive bool', async function () {
    await expect(
      await this.contract.mintingActive()
    ).to.equal(false);
    await this.contract.toggleMinting();
    await expect(
      await this.contract.mintingActive()
    ).to.equal(true);
    await this.contract.toggleMinting();
    await expect(
      await this.contract.mintingActive()
    ).to.equal(false);
  });

  it('toggleEarlyAccessMode function changes earlyAccessMode bool', async function () {
    await expect(
      await this.contract.earlyAccessMode()
    ).to.equal(true);
    await this.contract.toggleEarlyAccessMode();
    await expect(
      await this.contract.earlyAccessMode()
    ).to.equal(false);
    await this.contract.toggleEarlyAccessMode();
    await expect(
      await this.contract.earlyAccessMode()
    ).to.equal(true);
  });

  // setRandPrime func checks

  it('setRandPrime function will set randPrime variable', async function () {
    await this.contract.setRandPrime(examplePrime);
    await expect(
      await this.contract.randPrime()
    ).to.be.bignumber.equal(examplePrime);
  });

  it('setRandPrime function will only allow being set one time', async function () {
    await this.contract.setRandPrime(examplePrime);
    await this.contract.setRandPrime(unsetPrime);
    await expect(
      await this.contract.randPrime()
    ).to.be.bignumber.equal(examplePrime);
  });

  // setBaseURI func checks

  it('setBaseURI function will set new metadata URI for NFTs', async function () {
    await this.contract.setBaseURI(exampleURI);
    await expect(
      await this.contract.tokenURI(1)
    ).to.equal(exampleURI + '1');
    await expect(
      await this.contract.tokenURI(2048)
    ).to.equal(exampleURI + '2048');
  });

  // mintItem func checks

  it('mintItem func will revert if merkle proof array is empty while in earlyAccessMode', async function () {
    await this.contract.setRandPrime(examplePrime);
    await this.contract.toggleMinting();
    await expectRevert(
      this.contract.mintItem(0, other, 1, [], 1, {value: 0, from: other}),
      'Invalid proof'
    );
  });

  it('mintItem func will revert if randPrime not set', async function () {
    await this.contract.toggleEarlyAccessMode();
    await this.contract.toggleMinting();
    await expectRevert(
      this.contract.mintItem(0, other, 1, [], 1, {value: 0, from: other}),
      'Random prime number must be specified by contract operator before minting'
    );
  });

  it('mintItem func will revert if mintingActive is false', async function () {
    await this.contract.setRandPrime(examplePrime);
    await this.contract.toggleEarlyAccessMode();
    await expect(
      await this.contract.mintingActive()
    ).to.equal(false);
    await expectRevert(
      this.contract.mintItem(0, other, 1, [], 1, {value: 0, from: other}),
      'Minting must be active'
    );
  });

  it('mintItem func will revert if numberOfTokens arg exceeds max or min per tx', async function () {
    await this.contract.setRandPrime(examplePrime);
    await this.contract.toggleMinting();
    await expectRevert(
      this.contract.mintItem(0, other, 1, [], 21, {value: 0, from: other}),
      'Cannot mint more than 20 at a time'
    );
    await this.contract.toggleEarlyAccessMode();
    await expectRevert(
      this.contract.mintItem(0, other, 1, [], 20, {value: 0, from: other}),
      'Cannot mint more than 6 at a time while not in early access mode'
    );
    await expectRevert(
      this.contract.mintItem(0, other, 1, [], 0, {value: 0, from: other}),
      'Must provide at least 1'
    );
  });

  // it('mintItem func will revert if minting would exceed soup balance per address when in earlyAccessMode', async function () {
  //   // Mint 6 Soups
  //   await this.nfs.setRandPrime(examplePrime);
  //   this.contract.mintItem(0, other, 1, [], 1, {value: 0, from: other}),
  //   await this.nfs.mintItem(3, {value: 0, from: other});
  //   const mintFive = await this.nfs.tokenOfOwnerByIndex(owner, 4);
  //   const mintSix = await this.nfs.tokenOfOwnerByIndex(owner, 5);
  //
  //
  //   // Begin Bauhaus - only mint 5 out of 6
  //   await this.contract.setRandPrime(examplePrime);
  //   await this.contract.toggleMinting();
  //   for (i = 0; i < 5; i++) {
  //     let tokenId = await this.nfs.tokenOfOwnerByIndex(owner, i);
  //     console.log(`Minting 1 mondrian using soup token Id ${tokenId}`);
  //     let res = await this.contract.mintItem(1, [tokenId], {value: 0});
  //     await expectEvent(
  //       res, 'Transfer'
  //     );
  //   }
  //   await expect(
  //     (await this.contract.balanceOf(owner)).toString()
  //   ).to.equal('5');
  //   console.log('should have 5 Bauhaus at this point');
  //   // Requesting 2 more would go over max (7 instead of 6) and should fail - with both items
  //   await expectRevert(
  //     this.contract.mintItem(2, [mintSix, mintFive], {value: 0}),
  //     'Minting would exceed allowance set in contract based upon your balance of Soups (NFS)'
  //   );
  //   // Requesting 2 more would go over max (7 instead of 6) and should fail - with one soup but 2 requested
  //   await expectRevert(
  //     this.contract.mintItem(2, [mintSix], {value: 0}),
  //     'Number of tokens requested must be equal to number of soup token Ids provided'
  //   );
  //   let res = await this.contract.mintItem(1, [mintSix], {value: 0});
  //   await expectEvent(
  //     res, 'Transfer'
  //   );
  //   await expect(
  //     (await this.contract.balanceOf(owner)).toString()
  //   ).to.equal('6');
  // });

  it('mintItem func lets you mint any when earlyAccessMode is off', async function () {
    await this.contract.setRandPrime(examplePrime);
    await this.contract.toggleEarlyAccessMode();
    await this.contract.toggleMinting();
    let res1 = await this.contract.mintItem(0, other, 1, [], 2, {value: 0, from: other});
    await expectEvent(
      res1, 'Transfer'
    );
    let res2 = await this.contract.mintItem(0, other, 1, [], 2, {value: 0, from: other});
    await expectEvent(
      res2, 'Transfer'
    );
    let res3 = await this.contract.mintItem(0, other, 1, [], 2, {value: 0, from: other});
    await expectEvent(
      res3, 'Transfer'
    );
    await expect(
      (await this.contract.balanceOf(other)).toString()
    ).to.equal('6');
  });

  // it('mintItem func will revert if sender does not own all provided tokens', async function () {
  //   console.log('Mint 1 soup to owner address');
  //   await this.nfs.setRandPrime(examplePrime);
  //   await this.nfs.mintItem(1, {value: 0});
  //   console.log('Fire up Bauhaus');
  //   await this.contract.setRandPrime(examplePrime);
  //   await this.contract.toggleMinting();
  //   console.log('Mint 1 Mondrian as a fake hodler - should fail');
  //   let tokenId = await this.nfs.tokenOfOwnerByIndex(owner, 0);
  //   await expectRevert(
  //     this.contract.mintItem(1, [tokenId], {value: 0, from: other}),
  //     'Sender is not the owner of provided soup'
  //   );
  // });
  //
  // it('mintItem func will mint only up to 8192 items with earlyAccessMode enabled', async function () {
  //   this.timeout(0); // dont timeout for this long test
  //   await this.contract.setRandPrime(examplePrime);
  //   await this.contract.toggleMinting();
  //   await this.contract.toggleEarlyAccessMode();
  //   for (i = 0; i < 2048; i++) {
  //     // let tokenId = await this.contract.tokenOfOwnerByIndex(owner, i);
  //     let res = await this.contract.mintItem(0, owner, 1, [], 4, {value: 0});
  //     await expectEvent(
  //       res, 'Transfer'
  //     );
  //   }
  //
  //   // We should have 8192 Bauhaus at this point but
  //   // we're unable to proceed until disabling SHM.
  //   console.log(`Expecting 8192 Bauhaus`);
  //   await expect(
  //     (await this.contract.totalSupply()).toString()
  //   ).to.equal('8192');
  //
  //   // Try to mint past upper boundaries
  //   console.log('Ensure it wont exceed max supply');
  //   await expectRevert(
  //     this.contract.mintItem(0, owner, 1, [], 1, {value: 0}),
  //     'Minting would exceed max supply'
  //   );
  // });

});
