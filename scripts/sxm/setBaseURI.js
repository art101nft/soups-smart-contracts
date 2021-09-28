const newURI = '';

module.exports = async function main(callback) {
  try {
    const soupXmondrian = artifacts.require("soupXmondrian");
    const sxm = await soupXmondrian.deployed();
    if (newURI == '') {
      console.log('You need to specify a metadata URI where assets can be loaded. ie: "ipfs://xxxxxx/{}"');
      callback(1);
    } else {
      await sxm.setBaseURI(newURI);
      console.log(`Set new contract base metadata URI as: ${newURI}`);
      callback(0);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
