const newMerkleRoot = '0x004718ffb956263645de73fd047a8b70223dacd78a6dc9025d5d89a21b8f4dcb';

module.exports = async function main(callback) {
  try {
    const Bauhaus = artifacts.require("Bauhaus");
    const contract = await Bauhaus.deployed();
    if (newMerkleRoot == '') {
      console.log('You need to specify a merkle root hash.');
      callback(1);
    } else {
      await contract.setMerkleRoot(newMerkleRoot);
      console.log(`Set new merkle root hash as: ${newMerkleRoot}`);
      callback(0);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
