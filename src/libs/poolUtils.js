const { ethers } = require('ethers');
const { Pool, Route } = require('@uniswap/v3-sdk');
const IUniswapV3PoolABI = require('@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json').abi;
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

async function getSlot0(inputToken, outputToken, poolFee) {
  if (!inputToken.address || !outputToken.address || !poolFee) {
    throw new Error("Invalid token or pool fee!");
  }

  try {
    const poolAddress = Pool.getAddress(inputToken, outputToken, poolFee);
    const poolContract = getContractInstance(poolAddress);
    const slot0 = await poolContract.slot0();
    return slot0;
  } catch (error) {
    console.error("Failed to read slot0 data:", error);
    throw error;
  }
}

const getPoolData = async (tokenA, tokenB, fee) => {
  const poolAddress = Pool.getAddress(tokenA, tokenB, fee);
  const poolContract = getContractInstance(poolAddress, IUniswapV3PoolABI);

  const [liquidity, slot0] = await Promise.all([
    poolContract.liquidity(),
    poolContract.slot0()
  ]);

  return new Pool(
    tokenA,
    tokenB,
    fee,
    slot0.sqrtPriceX96.toString(),
    liquidity.toString(),
    Number(slot0.tick)
  );
};

async function getRoute(inputToken, outputToken, poolFee = 3000) {
  const pool = await getPoolData(inputToken, outputToken, poolFee);
  return new Route([pool], inputToken, outputToken);
}

module.exports = { getSlot0, getRoute, getPoolData, getContractInstance };
