import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import MyContract from '../abis/MyContract.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // Load Token
    const networkId =  await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }
    // load mycontract 
    const mycontractData = MyContract.networks[networkId]
    if(mycontractData) {
      const mycontract = new web3.eth.Contract(MyContract.abi, mycontractData.address)
      this.setState({ mycontract })
      //let data = await MyContract.methods.data.call(this.state.account)
      //this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }


    // Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
    } else {
      window.alert('EthSwap contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
      // request data price
    const oracleAddress =
    process.env.TRUFFLE_CL_BOX_ORACLE_ADDRESS ||
    '0xc99B3D447826532722E41bc36e644ba3479E4365'
    const jobId =
      process.env.TRUFFLE_CL_BOX_JOB_ID || '956db887488348b59b72dc8caa551385'
    const payment = process.env.TRUFFLE_CL_BOX_PAYMENT || '1000000000000000000'
    const url =
      process.env.TRUFFLE_CL_BOX_URL ||
      'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
    const path = process.env.TRUFFLE_CL_BOX_JSON_PATH || 'USD'
    const times = process.env.TRUFFLE_CL_BOX_TIMES || '100'

    this.state.mycontract.methods.createRequestTo(
      oracleAddress,
      window.web3.utils.toHex(jobId),
      payment,
      url,
      path,
      times,
    ).send({from: this.state.account}).on('transactionHash', (hash) => {
      console.log(hash);
 
      //read contract
      const price = this.state.mycontract.methods.data.call({from: this.state.account}).then(console.log);
      const price1 = window.web3.utils.toHex(price);
      const ETHUSD = parseInt(price1)
      console.log(ETHUSD)


      this.state.ethSwap.methods.buyTokens(ETHUSD).send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
        this.state.mycontract.methods.data.call({from: this.state.account}).then(console.log);
        console.log(ETHUSD);
        this.setState({ loading: false })
      })
    })
    

  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
      //request data price
    const oracleAddress =
    process.env.TRUFFLE_CL_BOX_ORACLE_ADDRESS ||
    '0xc99B3D447826532722E41bc36e644ba3479E4365'
    const jobId =
      process.env.TRUFFLE_CL_BOX_JOB_ID || '956db887488348b59b72dc8caa551385'
    const payment = process.env.TRUFFLE_CL_BOX_PAYMENT || '1000000000000000000'
    const url =
      process.env.TRUFFLE_CL_BOX_URL ||
      'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
    const path = process.env.TRUFFLE_CL_BOX_JSON_PATH || 'USD'
    const times = process.env.TRUFFLE_CL_BOX_TIMES || '100'


      this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        
      this.state.mycontract.methods.createRequestTo(
        oracleAddress,
        window.web3.utils.toHex(jobId),
        payment,
        url,
        path,
        times,
      ).send({from: this.state.account}).on('transactionHash', (hash) => {
        console.log(hash);
        // read contract price
      const price = this.state.mycontract.methods.data.call({from: this.state.account}).then(console.log);
      const price1 = window.web3.utils.toHex(price);
      const ETHUSD = parseInt(price1)
      console.log(ETHUSD)
        this.state.ethSwap.methods.sellTokens(tokenAmount, ETHUSD).send({ from: this.state.account }).on('transactionHash', (hash) => {
          this.setState({ loading: false })
        })
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens={this.buyTokens}
        sellTokens={this.sellTokens}
      />
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
              <h2>Swap ETH to USDL Token</h2>
              
                {content}

              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
