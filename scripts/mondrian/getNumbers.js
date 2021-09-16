module.exports = async function main(callback) {
  try {
    const Mondrian = artifacts.require("Mondrian");
    const mnd = await Mondrian.deployed();
    const existingPrime = (await mnd.RAND_PRIME()).toString();
    const existingTimestamp = (await mnd.TIMESTAMP()).toString();
    console.log(`RAND_PRIME: ${existingPrime}`);
    console.log(`TIMESTAMP: ${existingTimestamp}`);
    console.log(`CONTRACT_ADDRESS: ${mnd.address}`);
    console.log(`BASE_URI: ${await mnd.baseURI()}`);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
