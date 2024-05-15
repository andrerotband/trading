const { ethers } = require('ethers');
const { Pool, Route } = require('@uniswap/v3-sdk');
const { Fetcher } = require('@uniswap/sdk-core');
const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json').abi;
const { provider } = require('./config');

const contractInstancesCache = new Map();

function getContract(poolAddress) {
  return new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
}

function getContractInstance(contractAddress) {
  if (contractInstancesCache.has(contractAddress)) {
    return contractInstancesCache.get(contractAddress);
  }
  const contractInstance = getContract(contractAddress);
  contractInstancesCache.set(contractAddress, contractInstance);
  return contractInstance;
}

async function getRoute(inputToken, outputToken) {
  const pair = Fetcher.fetchPairData(inputToken, outputToken, provider);
  const route = new Route([pair], inputToken);
  return route;
}

async function getSlot0(inputToken, outputToken, poolFee) {
  if (!inputToken.address || !outputToken.address || !poolFee) {
    throw new Error("Token inválido!");
  }

  try {
    const poolAddress = Pool.getAddress(inputToken, outputToken, poolFee);
    const poolContract = getContractInstance(poolAddress);
    // const poolTicks = await poolContract.ticks
    const slot0 = await poolContract.slot0();
    return slot0;
  } catch (error) {
    console.error("Falha lendo slot0 data:", error);
    throw error;
  }
}

/*
async function getPoolData(tokenA, tokenB, fee) {
  const poolAddress = Pool.getAddress(tokenA, tokenB, fee);
  const poolContract = new ethers.Contract(poolAddress, IUniswapV3PoolABI, provider);
  const poolData = await poolContract.slot0();
  const tickerProvider = new NoTickDataProvider()
  const ticker = await tickerProvider.getTick(Number(poolData.tick))
  console.log(ticker)
  const [liquidity, slot0] =
    await Promise.all([
      poolContract.liquidity(),
      poolContract.slot0()
    ])
  console.log(slot0, liquidity, poolData.tick)
  return new Pool(
    tokenA,
    tokenB,
    fee,
    slot0.sqrtPriceX96.toString(),
    liquidity.toString(),
    Number(poolData.tick)
  );
}

async function getQuote(inputAmount, inputToken, outputToken, fee) {
  const pool = await getPoolData(inputToken, outputToken, fee);
  const route = new Route([pool], inputToken, outputToken);
  const trade = await Trade.exactIn(route, CurrencyAmount.fromRawAmount(inputToken, ethers.parseUnits(inputAmount, inputToken.decimals).toString()), new Percent('1', '100'));
  console.log(`1 ${inputToken.symbol} = ${trade.executionPrice.toSignificant(6)} ${outputToken.symbol}`);
  console.log(`Minimum received after slippage: ${trade.minimumAmountOut(new Percent('50', '10000')).toSignificant(6)} ${outputToken.symbol}`);
}
*/

module.exports = { getSlot0, getRoute };
