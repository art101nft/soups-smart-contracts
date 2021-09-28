const newMerkleRoot = '0xbe30e27a307c02cd711faf4551f6f11ed510e737e026e12de7177bf9ee614f28';

module.exports = async function main(callback) {
  try {
    const soupXmondrian = artifacts.require("soupXmondrian");
    const sxm = await soupXmondrian.deployed();
    if (newMerkleRoot == '') {
      console.log('You need to specify a merkle root hash.');
      callback(1);
    } else {
      await sxm.setMerkleRoot(newMerkleRoot);
      console.log(`Set new merkle root hash as: ${newMerkleRoot}`);
      callback(0);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
