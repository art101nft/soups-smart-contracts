module.exports = async function main(callback) {
  try {
    const Mondrian = artifacts.require("Mondrian");
    const mnd = await Mondrian.deployed();
    const shmEnabled = await mnd.soupHodlersMode();
    console.log(`[+] Toggling soupHodlersMode. Currently: ${shmEnabled}`);
    if (shmEnabled) {
      await mnd.toggleSHM();
      console.log(`Soups disabled!`);
    } else {
      await mnd.toggleSHM();
      console.log(`Soups enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
