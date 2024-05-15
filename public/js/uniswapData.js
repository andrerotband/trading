const { ethers } = require('./libs/config');
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY');
const poolAddress = 'AQUI_ENDERECO_DO_POOL'; // Exemplo: Pool de ETH/USDC

// ABI simplificada para o pool da Uniswap V3
const poolAbi = [
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
  'function liquidity() view returns (uint128)',
];

// Crie uma instância do contrato
const poolContract = new ethers.Contract(poolAddress, poolAbi, provider);

async function getPoolData() {
  const [slot0, liquidity] = await Promise.all([
    poolContract.slot0(),
    poolContract.liquidity()
  ]);

  console.log('Preço sqrt (sqrtPriceX96):', slot0.sqrtPriceX96.toString());
  console.log('Liquidez do pool:', liquidity.toString());
}

getPoolData().catch(console.error);




document.addEventListener('DOMContentLoaded', function () {
  fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false')
    .then(response => response.json())
    .then(data => updateTable(data))
    .catch(error => console.error('Error fetching data: ', error));
});

function updateTable(data) {
  const tableBody = document.getElementById('cryptoTable').getElementsByTagName('tbody')[0];
  data.forEach((coin, index) => {
    let row = tableBody.insertRow();
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);
    let cell5 = row.insertCell(4);

    cell1.innerHTML = index + 1;
    cell2.innerHTML = `${coin.name} (${coin.symbol.toUpperCase()})`;
    cell3.innerHTML = `$${coin.current_price.toFixed(2)}`;
    cell4.innerHTML = `${coin.price_change_percentage_24h.toFixed(2)}%`;
    cell5.innerHTML = `$${coin.market_cap.toLocaleString()}`;
  });
}
