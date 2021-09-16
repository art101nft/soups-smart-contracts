module.exports = async function main(callback) {
  try {
    const Mondrian = artifacts.require("Mondrian");
    const mnd = await Mondrian.deployed();
    const salesActive = await mnd.salesActive();
    console.log(`[+] Toggling salesActive. Currently: ${salesActive}`);
    if (salesActive) {
      await mnd.toggleSale();
      console.log(`Sales disabled!`);
    } else {
      await mnd.toggleSale();
      console.log(`Sales enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
