const newURI = '';

module.exports = async function main(callback) {
  try {
    const Mondrian = artifacts.require("Mondrian");
    const mnd = await Mondrian.deployed();
    await mnd.mintItem(3, []);
    await mnd.mintItem(3, []);
    await mnd.mintItem(3, []);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
