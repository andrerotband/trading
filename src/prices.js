/* eslint-disable no-undef */
require('dotenv').config();
const { Web3 } = require('web3');

// Configure Web3 com um provider da Infura (ou outro serviço similar)
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL))

class TokenPrice {
  constructor (contractAddress) {
    this.contractAddress = contractAddress;
    this.contract = new web3.eth.Contract([
      // ABI simplificada que inclui apenas a função que precisamos
      {
        "constant": true,
        "inputs": [],
        "name": "latestAnswer",
        "outputs": [{ "name": "", "type": "int256" }],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      }
    ], contractAddress);
  }

  async getPrice() {
    try {
      const price = await this.contract.methods.latestAnswer().call();
      console.log(Number(price) / 100000000)
      return Number(price) / 1e8; // Ajuste de acordo com a precisão do token
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  }
}

// Exemplo de endereço de contrato para um Price Feed da Chainlink (ETH/USD)
const ethPriceContract = new TokenPrice('0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419');

async function displayETHPrice() {
  const price = await ethPriceContract.getPrice();
  console.log('ETH Price in USD:', price);
}

displayETHPrice();
