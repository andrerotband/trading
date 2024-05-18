/* eslint-disable no-undef */
// config.js
require('dotenv').config();
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const MAX_FEE_PER_GAS = 100000000000
const MAX_PRIORITY_FEE_PER_GAS = 100000000000
const TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER = 10000

module.exports = {
  provider, signer, wallet, ethers,
  MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS, TOKEN_AMOUNT_TO_APPROVE_FOR_TRANSFER
};
