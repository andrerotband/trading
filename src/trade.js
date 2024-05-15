const { Route, Trade } = require('@uniswap/v3-sdk');
const { CurrencyAmount, TradeType, Percent, TokenAmount } = require('@uniswap/sdk-core');
const { getPoolData, getRoute } = require('./libs/poolUtils');
const { signer } = require('./libs/config');
const { WETH, USDC } = require('./libs/tokens');


async function getTradePrice(inputToken, outputToken, amountIn) {
  const route = await getRoute(inputToken, outputToken);
  //  const amountIn = ethers.utils.parseUnits(amountInEth.toString(), 'ether'); // Converter quantidade de entrada para unidades de wei
  const trade = new Trade(route, new TokenAmount(inputToken, amountIn.toString()), TradeType.EXACT_INPUT);

  const executionPrice = trade.executionPrice.toSignificant(6);
  const nextMidPrice = trade.nextMidPrice.toSignificant(6);

  console.log(`O preço de execução para 1 ${inputToken} é aproximadamente: ${executionPrice} ${outputToken}`);
  console.log(`O próximo preço médio após o trade será: ${nextMidPrice} ${outputToken}`);

  return { executionPrice, nextMidPrice };
}


async function main() {
  // Simulated pool data
  const pool = await getPoolData(WETH, USDC, 3000);
  console.log('Pool initialized:', pool);

  // Route
  const route = new Route([pool], WETH, USDC);
  console.log('Route initialized:', route);

  // Trade parameters
  const tradeAmount = CurrencyAmount.fromRawAmount(WETH, '1000000000000000');
  const trade = new Trade(route, tradeAmount, TradeType.EXACT_INPUT);
  console.log('Trade initialized:', trade);
  // Transaction preparation
  const slippageTolerance = new Percent('50', '10000'); // 0.50%
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
  const amountOutMin = trade.minimumAmountOut(slippageTolerance).toString()
  const params = {
    deadline,
    amountIn: trade.amountIn,
    amountOutMin,
    path: [WETH.address, USDC.address],
    recipient: signer.address,
    sqrtPriceLimitX96: '0'
  };

  console.log(`Executing trade with params: ${JSON.stringify(params)}`);

  // Here you would interact with the Uniswap contract to execute the trade
  console.log('Trade executed successfully (simulation).');
}
module.exports = { getTradePrice }

// main().catch(error => console.error(error));
