const newURI = 'ipfs://Qme9P14Co3GgrDRj45nvxGdARUYu3EfndJ6RwRaYM1kbUJ/'; // live oct 19 12:48 AM 

module.exports = async function main(callback) {
  try {
    const Bauhaus = artifacts.require("Bauhaus");
    const contract = await Bauhaus.deployed();
    if (newURI == '') {
      console.log('You need to specify a metadata URI where assets can be loaded. ie: "ipfs://xxxxxx/"');
      callback(1);
    } else {
      await contract.setBaseURI(newURI);
      console.log(`Set new contract base metadata URI as: ${newURI}`);
      callback(0);
    }
  } catch (error) {
    console.error(error);
    callback(1);
  }
}
