/* eslint-disable no-undef */
require('dotenv').config();
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Uniswap V3 SwapRouter address on Ethereum mainnet
const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

const ISwapRouterABI = [
  'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)'
];

//const MAX_FEE_PER_GAS = 100000000000
//const MAX_PRIORITY_FEE_PER_GAS = 100000000000
//const TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = 10000

const MAX_FEE_PER_GAS = ethers.parseUnits('100', 'gwei');
const MAX_PRIORITY_FEE_PER_GAS = ethers.parseUnits('2', 'gwei');
const TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = ethers.parseUnits('10000', 18);


module.exports = {
  provider, wallet, ethers, swapRouterAddress, ISwapRouterABI,
  MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS, TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
};
