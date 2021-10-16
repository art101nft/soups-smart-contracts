module.exports = async function main(callback) {
  try {
    const Bauhaus = artifacts.require("Bauhaus");
    const contract = await Bauhaus.deployed();
    const preaccessMode = await contract.preaccessMode();
    console.log(`[+] Toggling preaccessMode. Currently: ${preaccessMode}`);
    if (preaccessMode) {
      await contract.togglePreaccess();
      console.log(`Preaccess mode disabled!`);
    } else {
      await contract.togglePreaccess();
      console.log(`Preaccess mode enabled!`);
    }
    callback(0);
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
