module.exports = async function main(callback) {
  try {
    const NonFungibleSoup = artifacts.require("NonFungibleSoup");
    const nfs = await NonFungibleSoup.deployed();
    for (i = 0; i < 1000; i++) {
      await nfs.mintItem(1);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
