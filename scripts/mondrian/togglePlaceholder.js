module.exports = async function main(callback) {
  try {
    const Mondrian = artifacts.require("Mondrian");
    const mnd = await Mondrian.deployed();
    const placeholderEnabled = await mnd.placeholderEnabled();
    console.log(`[+] Toggling placeholderEnabled. Currently: ${placeholderEnabled}`);
    if (placeholderEnabled) {
      await mnd.togglePlaceholder();
      console.log(`Metadata placeholder disabled!`);
    } else {
      await mnd.togglePlaceholder();
      console.log(`Metadata placeholder enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
