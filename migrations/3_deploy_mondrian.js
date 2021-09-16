const NonFungibleSoup = artifacts.require("NonFungibleSoup");
const Mondrian = artifacts.require("Mondrian");

module.exports = async function(deployer) {
  const nfs = await NonFungibleSoup.deployed();
  await deployer.deploy(Mondrian, nfs.address);
};
