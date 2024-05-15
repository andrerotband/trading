/* eslint-disable no-undef */
// config.js
require('dotenv').config();
const { ethers } = require('ethers');
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
module.exports = { provider, signer, wallet, ethers };
