const HDWalletProvider = require('@truffle/hdwallet-provider')
require('babel-register');
require('babel-polyfill');

module.exports = {
  networks: {
    cldev: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    live: {
      provider: () => {
        return new HDWalletProvider("Your seed here", 'https://kovan.infura.io/v3/your_api')  
      },
      network_id: '*',
      // Necessary due to https://github.com/trufflesuite/truffle/issues/1971
      // Should be fixed in Truffle 5.0.17
      skipDryRun: true,
    },  
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: '0.4.24',
       
      
    },
  },
}
