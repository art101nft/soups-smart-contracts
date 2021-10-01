module.exports = async function main(callback) {
  try {
    const soupXmondrian = artifacts.require("soupXmondrian");
    const sxm = await soupXmondrian.deployed();
    const mintingActive = await sxm.mintingActive();
    console.log(`[+] Toggling mintingActive. Currently: ${mintingActive}`);
    if (mintingActive) {
      await sxm.toggleMinting();
      console.log(`Sales disabled!`);
    } else {
      await sxm.toggleMinting();
      console.log(`Sales enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
