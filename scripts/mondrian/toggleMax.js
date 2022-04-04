module.exports = async function main(callback) {
  try {
    const Mondrian = artifacts.require("Mondrian");
    const mnd = await Mondrian.deployed();
    const maxEnforced = await mnd.maxItemsEnforced();
    console.log(`[+] Toggling maxItemsEnforced. Currently: ${maxEnforced}`);
    if (maxEnforced) {
      await mnd.toggleMaxEnforced();
      console.log(`Max items not enforced!`);
    } else {
      await mnd.toggleMaxEnforced();
      console.log(`Max items enforced!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
