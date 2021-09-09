module.exports = async function main(callback) {
  try {
    const NonFungibleSoup = artifacts.require("NonFungibleSoup");
    const nfs = await NonFungibleSoup.deployed();
    const existingPrime = (await nfs.RAND_PRIME()).toString();
    const existingTimestamp = (await nfs.TIMESTAMP()).toString();
    console.log(`RAND_PRIME: ${existingPrime}`);
    console.log(`TIMESTAMP: ${existingTimestamp}`);
    console.log(`CONTRACT_ADDRESS: ${nfs.address}`);
    console.log(`BASE_URI: ${await nfs.baseURI()}`);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
