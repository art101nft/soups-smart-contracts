module.exports = async function main(callback) {
  try {
    const NonFungibleSoup = artifacts.require("NonFungibleSoup");
    const nfs = await NonFungibleSoup.deployed();
    await nfs.withdraw();
    console.log('Contract balance has been withdrawn to contract creator. Check your balance!')
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
