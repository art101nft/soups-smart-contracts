module.exports = async function main(callback) {
  try {
    const Bauhaus = artifacts.require("Bauhaus");
    const contract = await Bauhaus.deployed();
    const existingPrime = (await contract.randPrime()).toString();
    const existingTimestamp = (await contract.timestamp()).toString();
    console.log(`randPrime: ${existingPrime}`);
    console.log(`timestamp: ${existingTimestamp}`);
    console.log(`contract address: ${contract.address}`);
    console.log(`baseURI: ${await contract.baseURI()}`);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
