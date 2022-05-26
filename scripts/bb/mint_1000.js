module.exports = async function main(callback) {
  try {
    const Bauhaus = artifacts.require("Bauhaus");
    const bb = await Bauhaus.deployed();
    for (i = 0; i < 1000; i++) {
      await bb.mintItem(1, bb.address, 1, [], 1);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
