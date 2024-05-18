const { ethers } = require('ethers');
const { WETH, USDC } = require('./libs/tokens');
const { wallet, provider, MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } = require('./libs/config');
const { getPoolData } = require('./libs/poolUtils');

async function executeTrade(inputParams) {
  try {
    const amountIn = ethers.parseUnits(inputParams.amount, 18); // Assume que amount é uma string representando a quantidade de ETH
    const inputToken = inputParams.inputToken === 'WETH' ? WETH : USDC;
    const outputToken = inputParams.outputToken === 'USDC' ? USDC : WETH;

    // Verificar saldo da carteira
    const balance = await provider.getBalance(wallet.address);
    if (balance < amountIn) {
      return {
        status: 'error',
        error: 'Saldo insuficiente para transação: ' + `${ethers.formatEther(balance)} ETH`,
      };
    }

    const pool = await getPoolData(inputToken, outputToken, 3000);
    if (!pool) {
      return {
        status: 'error',
        error: 'Informações do Pool não encontrados',
      };
    }

    const amountOutMin = amountIn;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current time

    const swapRouterAddress = '0xE592427A0AEce92De3Edee1F18E0157C05861564'; // Uniswap V3 SwapRouter address on Ethereum mainnet
    const ISwapRouterABI = [
      'function exactInputSingle(tuple(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params) external payable returns (uint256 amountOut)'
    ];

    const swapRouterContract = new ethers.Contract(swapRouterAddress, ISwapRouterABI, wallet);

    const params = {
      tokenIn: inputToken.address,
      tokenOut: outputToken.address,
      fee: 3000,
      recipient: wallet.address,
      deadline: deadline,
      amountIn: amountIn.toString(),
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: '0'
    };

    // Verificar e aprovar o token de entrada, se necessário
    if (inputToken.address !== WETH.address) {
      const tokenContract = new ethers.Contract(inputToken.address, [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function allowance(address owner, address spender) external view returns (uint256)'
      ], wallet);

      const allowance = await tokenContract.allowance(wallet.address, swapRouterAddress);
      console.log(`Current allowance: ${allowance.toString()}`);

      if (allowance.lt(amountIn)) {
        console.log('Approving token...');
        const approveTx = await tokenContract.approve(swapRouterAddress, amountIn);
        await approveTx.wait();
        console.log('Token approved');
      }
    }

    const transaction = {
      data: swapRouterContract.interface.encodeFunctionData('exactInputSingle', [params]),
      to: swapRouterAddress,
      value: inputToken.address === WETH.address ? amountIn : 0,
      from: wallet.address,
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    };

    // Criar a transação de swap
    const tx = await wallet.sendTransaction(transaction);

    console.log(`Transaction hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);

    return {
      status: 'success',
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error executing trade:', error.message);

    return {
      status: 'error',
      error: error.message,
    };
  }
}

module.exports = { executeTrade };
