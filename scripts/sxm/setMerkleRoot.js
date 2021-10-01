const newMerkleRoot = '';

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
