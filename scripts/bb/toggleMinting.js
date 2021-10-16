module.exports = async function main(callback) {
  try {
    const Bauhaus = artifacts.require("Bauhaus");
    const contract = await Bauhaus.deployed();
    const mintingActive = await contract.mintingActive();
    console.log(`[+] Toggling mintingActive. Currently: ${mintingActive}`);
    if (mintingActive) {
      await contract.toggleMinting();
      console.log(`Minting disabled!`);
    } else {
      await contract.toggleMinting();
      console.log(`Minting enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
