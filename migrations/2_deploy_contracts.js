const Token = artifacts.require("Token");
const MyContract = artifacts.require('MyContract');
const { LinkToken } = require('@chainlink/contracts/truffle/v0.4/LinkToken')
const { Oracle } = require('@chainlink/contracts/truffle/v0.4/Oracle')
const EthSwap = artifacts.require("EthSwap");


module.exports = async function(deployer, network, [defaultAccount]) {


  // Deploy Mycontract
  if (!network.startsWith('live')) {

    LinkToken.setProvider(deployer.provider)
    Oracle.setProvider(deployer.provider)

    deployer.deploy(LinkToken, { from: defaultAccount }).then(link => {
      return deployer
        .deploy(Oracle, link.address, { from: defaultAccount })
        .then(() => {
          return deployer.deploy(MyContract, link.address)
        })
    })
  } else {
    // For live networks, use the 0 address to allow the ChainlinkRegistry
    // contract automatically retrieve the correct address for you
    deployer.deploy(MyContract, '0x0000000000000000000000000000000000000000')
    // Deploy Token
    await deployer.deploy(Token);
    const token = await Token.deployed()
    // Deploy EthSwap
    await deployer.deploy(EthSwap, token.address);
    const ethSwap = await EthSwap.deployed()
  
    // Transfer all tokens to EthSwap (1 million)
    await token.transfer(ethSwap.address, '1000000000000000000000000')
  }

};
