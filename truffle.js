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
      confirmations: 1,
      timeoutBlocks: 10,
      skipDryRun: true,
      production: false,
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://mainnet.infura.io/v3/" + process.env.INFURA_PID),
      network_id: 1,
      confirmations: 3,
      timeoutBlocks: 30,
      skipDryRun: false,
      production: true,
      gasPrice: 100000000000
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
  api_keys: {
    'etherscan': process.env.ETHERSCAN_API
  }
};
