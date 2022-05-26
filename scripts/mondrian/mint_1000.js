const newURI = '';

module.exports = async function main(callback) {
  try {
    const Mondrian = artifacts.require("Mondrian");
    const mnd = await Mondrian.deployed();
    for (i = 0; i < 1000; i++) {
      await mnd.mintItem(1, []);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
