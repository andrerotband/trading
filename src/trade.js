const { ethers } = require('ethers');
const { WETH, USDC } = require('./libs/tokens');
const { wallet, provider, MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS,
  swapRouterAddress, ISwapRouterABI } = require('./libs/config');
const { getPoolData } = require('./libs/poolUtils');

const myFee = 3000;

async function executeTrade(inputParams) {
  try {
    const amountIn = ethers.parseUnits(inputParams.amount, 18);
    const inputToken = inputParams.inputToken === 'WETH' ? WETH : USDC;
    const outputToken = inputParams.outputToken === 'USDC' ? USDC : WETH;

    // Verificar saldo da carteira
    const balance = await provider.getBalance(wallet.address);
    if (balance < amountIn) {
      return {
        status: 'error',
        errorMsg: `Saldo insuficiente para transação: ${ethers.formatEther(balance)} ETH`,
      };
    }

    const pool = await getPoolData(inputToken, outputToken, myFee);
    if (!pool) {
      return {
        status: 'error',
        errorMsg: 'Informações do Pool não encontrados',
      };
    }

    const amountOutMin = amountIn;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current time
    const swapRouterContract = new ethers.Contract(swapRouterAddress, ISwapRouterABI, wallet);

    const params = {
      tokenIn: inputToken.address,
      tokenOut: outputToken.address,
      fee: myFee,
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
      if (allowance < amountIn) {
        const approveTx = await tokenContract.approve(swapRouterAddress, amountIn);
        const receipt = await approveTx.wait();

        // Verificar se a transação de aprovação foi bem-sucedida
        if (receipt.status === 0) {
          return {
            status: 'error',
            errorMsg: 'Falha ao aprovar o token de entrada.',
          };
        }
      }
    }

    // Cria transação de swap
    const transaction = {
      data: swapRouterContract.interface.encodeFunctionData('exactInputSingle', [params]),
      to: swapRouterAddress,
      value: inputToken.address === WETH.address ? amountIn : 0,
      from: wallet.address,
      maxFeePerGas: MAX_FEE_PER_GAS,
      maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
    };

    const tx = await wallet.sendTransaction(transaction);
    const receipt = await tx.wait();

    console.log(`Transaction hash: ${tx.hash} confirmed in block ${receipt.blockNumber}`);

    return {
      status: 'success',
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error('Error executing trade:', error.info.error);

    return {
      status: 'error',
      errorMsg: error.info.error,
    };
  }
}

module.exports = { executeTrade };
