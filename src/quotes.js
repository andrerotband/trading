const { USDC, WETH } = require('./libs/tokens')
const { getSlot0 } = require('./libs/poolUtils')

async function getPrice(inputParams) {
  const inputAmount = Number(inputParams.amount);
  const inputToken = inputParams.coin === 'ETH' ? WETH : USDC;
  const outputToken = inputParams.coin === 'ETH' ? USDC : WETH;
  console.log('Input', inputToken.symbol, 'Output', outputToken.symbol)

  try {
    const { sqrtPriceX96 } = await getSlot0(inputToken, outputToken, 3000);
    const decimalDifference = inputToken.decimals - outputToken.decimals;
    const factor = Math.pow(2, 192);
    const pricePerToken = factor / Math.pow(Number(sqrtPriceX96.toString()), 2)// * Number(10 ** decimalDifference);

    const adjustedPricePerToken = decimalDifference > 0
      ? pricePerToken * Math.pow(10, decimalDifference)
      : Math.pow(10, decimalDifference) / pricePerToken

    const estimatedAmountInTokenB = adjustedPricePerToken * inputAmount;
    const tradeCost = 0.002
    const finalPrice = estimatedAmountInTokenB * (1 - tradeCost)

    console.log('Input Amount:', inputAmount, adjustedPricePerToken, finalPrice);
    // console.log('Price Per Token:', adjustedPricePerToken);
    // console.log('Estimated Amount in Output Token:', finalPrice);

    return finalPrice.toFixed(8)
  } catch (error) {
    console.error("Error calculating price:", error);
    throw error;
  }
}

module.exports = { getPrice }