module.exports = async function main(callback) {
  try {
    const soupXmondrian = artifacts.require("soupXmondrian");
    const sxm = await soupXmondrian.deployed();
    const salesActive = await sxm.salesActive();
    console.log(`[+] Toggling salesActive. Currently: ${salesActive}`);
    if (salesActive) {
      await sxm.toggleSale();
      console.log(`Sales disabled!`);
    } else {
      await sxm.toggleSale();
      console.log(`Sales enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
