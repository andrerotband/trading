const express = require('express');
const router = express.Router();
const { WalletInfo } = require('../src/myWallet');
const walletInfo = new WalletInfo();
const { getPrice } = require('../src/quotes');

router.use((err, req, res, next) => {
  console.error(err.stack, next);
  res.status(500).send({ error: 'Something went wrong!' });
});

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Express', message: 'CryptoDash' });
});

router.post('/connectWallet', async (req, res) => {
  try {
    const connectionResult = await walletInfo.connectWallet(req.body.ethereum);
    res.json(connectionResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/wallet', async (req, res) => {
  try {
    const balance = await walletInfo.getBalance();
    const address = await walletInfo.getAddress();
    const transactionCount = await walletInfo.getTransactionCount();
    res.json({ balance, address, transactionCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quotes', async (req, res) => {
  try {
    const price = await getPrice(req.body);
    res.json(price);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/trade', async (req, res) => {
  const { inputToken, outputToken, amount } = req.body;
  try {
    const { executeTrade } = require('../src/trade');
    const result = await executeTrade({ inputToken, outputToken, amount });
    res.json(result);
  } catch (error) {
    console.error('Erro executando trade:', error);
    res.status(500).json({ error: 'Erro executando trade' });
  }
});


module.exports = router;
