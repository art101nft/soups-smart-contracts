module.exports = async function main(callback) {
  try {
    const soupXmondrian = artifacts.require("soupXmondrian");
    const sxm = await soupXmondrian.deployed();
    const mintingActive = await sxm.mintingActive();
    console.log(`[+] Toggling mintingActive. Currently: ${mintingActive}`);
    if (mintingActive) {
      await sxm.toggleMinting();
      console.log(`Minting disabled!`);
    } else {
      await sxm.toggleMinting();
      console.log(`Minting enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
