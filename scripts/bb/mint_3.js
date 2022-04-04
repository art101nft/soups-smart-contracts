module.exports = async function main(callback) {
  try {
    const Bauhaus = artifacts.require("Bauhaus");
    const bb = await Bauhaus.deployed();
    await bb.mintItem(1, bb.address, 1, [], 3);
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
