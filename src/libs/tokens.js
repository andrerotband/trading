// tokens.js
const { Token } = require('@uniswap/sdk-core');

const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin');
const WETH = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether');

const getDecimal = (coinToken) => {
  return coinToken.decimals;
}

const toTokenUnits = (amount, token) => {
  return (amount / Math.pow(10, token.decimals)).toFixed(token.decimals);
}

const fromTokenUnits = (amountStr, token) => {
  return Math.round(Number(amountStr) * Math.pow(10, token.decimals));
}

module.exports = { USDC, WETH, getDecimal, toTokenUnits, fromTokenUnits };
