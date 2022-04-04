module.exports = async function main(callback) {
  try {
    const NonFungibleSoup = artifacts.require("NonFungibleSoup");
    const nfs = await NonFungibleSoup.deployed();
    await nfs.mintItem(3);
    await nfs.mintItem(3);
    await nfs.mintItem(3);
    await nfs.mintItem(3);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
