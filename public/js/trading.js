class Trading {
  constructor () {
    this.initElements();
    this.setupListeners();
  }

  initElements() {
    const ids = [
      'loadingSpinnerTrading', 'inputToken', 'outputToken', 'inputAmount', 'btnExecuteTrade', 'tradeResult'
    ];
    this.elements = ids.reduce((acc, id) => {
      const element = document.getElementById(id);
      if (element) {
        acc[id] = element;
      }
      return acc;
    }, {});
  }

  setupListeners() {
    if (this.elements.btnExecuteTrade) {
      this.elements.btnExecuteTrade.addEventListener('click', this.executeTrade.bind(this));
    }
  }

  async executeTrade() {
    const inputToken = this.elements.inputToken.value.trim();
    const outputToken = this.elements.outputToken.value.trim();
    const amount = this.elements.inputAmount.value.trim();
    if (!amount) return;
    this.showLoading(true);
    try {
      const response = await fetch('/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputToken, outputToken, amount })
      });
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      this.elements.tradeResult.value = JSON.stringify(data);
    } catch (error) {
      const errorMsg = 'Erro executando Trade';
      console.error(errorMsg, error);
      this.elements.tradeResult.value = errorMsg;
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(isLoading) {
    this.elements.loadingSpinnerTrading.classList.toggle('d-none', !isLoading);
    this.elements.inputToken.disabled = isLoading;
    this.elements.outputToken.disabled = isLoading;
    this.elements.inputAmount.disabled = isLoading;
    this.elements.btnExecuteTrade.disabled = isLoading;
  }
}