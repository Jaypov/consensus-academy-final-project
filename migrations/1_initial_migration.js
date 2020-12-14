const Migrations = artifacts.require("Migrations");
const ResearchMarketPlace = artifacts.require("ResearchMarketPlace");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(ResearchMarketPlace, 2);
}
