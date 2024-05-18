class Conversion {
  constructor () {
    this.initElements();
    this.setupListeners();
    this.updateConversion()
  }

  initElements() {
    const ids = [
      'loadingSpinnerConversion', 'inputPay', 'inputReceive', 'btnInputPay', 'btnInputReceive',
      'imgInputPay', 'imgInputReceive', 'labelInputPay', 'labelInputReceive', 'invertButton', 'btnRefresh',
      'divInputPay', 'divInputReceive'
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
    if (this.elements.inputPay) {
      this.elements.inputPay.addEventListener('input', this.debounce(this.updateConversion.bind(this), 1000));
    }
    if (this.elements.imgRefresh) {
      this.elements.btnRefresh.addEventListener('click', this.updateConversion.bind(this));
    }
    if (this.elements.invertButton) {
      this.elements.invertButton.addEventListener('click', this.invertCurrencies.bind(this));
    }
  }

  debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    }.bind(this);
  }

  async updateConversion() {
    const amount = this.elements.inputPay.value.trim();
    if (!amount) return;
    this.showLoading(true);
    try {
      const response = await fetch('/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, coin: this.elements.labelInputPay.textContent })
      });
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      if (this.elements.inputReceive) {
        this.elements.inputReceive.value = data;
      }
    } catch (error) {
      const errorMsg = 'Erro calculando coversão';
      console.error(errorMsg, error);
      alert(errorMsg);
    } finally {
      this.showLoading(false);
    }
  }

  invertCurrencies() {
    this.animateInversion();
    [this.elements.inputPay.value, this.elements.inputReceive.value] = [1, this.elements.inputPay.value];
    [this.elements.imgInputPay.src, this.elements.imgInputReceive.src] = [this.elements.imgInputReceive.src, this.elements.imgInputPay.src];
    [this.elements.labelInputPay.textContent, this.elements.labelInputReceive.textContent] = [this.elements.labelInputReceive.textContent, this.elements.labelInputPay.textContent];
    this.updateConversion();
  }

  animateInversion() {
    const elementsToAnimate = [this.elements.divInputPay, this.elements.divInputReceive];
    elementsToAnimate.forEach(el => el.classList.add('flash-border'));
    setTimeout(() => {
      elementsToAnimate.forEach(el => el.classList.remove('flash-border'));
    }, 600);
  }

  showLoading(isLoading) {
    this.elements.loadingSpinnerConversion.classList.toggle('d-none', !isLoading);
    this.elements.inputPay.disabled = isLoading;
    this.elements.inputReceive.disabled = isLoading;
    this.elements.btnRefresh.disabled = isLoading;
  }
}