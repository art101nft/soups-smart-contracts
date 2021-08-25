require('dotenv').config();
const HDWalletProvider = require('truffle-hdwallet-provider');

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://rinkeby.infura.io/v3/" + process.env.INFURA_PID),
      network_id: 4,
      gas: 27500000,
      confirmations: 1,
      timeoutBlocks: 10,
      skipDryRun: true,
      production: false,
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://mainnet.infura.io/v3/" + process.env.INFURA_PID),
      network_id: 1,
      gasPrice: 44000000000,
      confirmations: 3,
      timeoutBlocks: 30,
      skipDryRun: false,
      production: true,
    },
  },
  mocha: {
    reporter: "eth-gas-reporter",
    reporterOptions: {
      currency: "USD",
      gasPrice: 2,
    },
  },
  compilers: {
    solc: {
      version: "^0.8.0",
    }
  },
  plugins: [
    'truffle-plugin-verify'
  ],
};
